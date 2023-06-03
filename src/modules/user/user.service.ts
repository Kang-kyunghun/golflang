import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository, Like } from 'typeorm';

import { UserState } from './entity/user-state.entity';
import { User } from './entity/user.entity';
import { CommonService } from 'src/common/common.service';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import {
  GetUserDetailOutputDto,
  GetUserListQueryDto,
  UserOutputDto,
  UserListOutputDto,
  UpdateUserInfoInputDto,
} from './dto';
import { UserError, USER_ERROR } from './error/user.error';
import { Account } from './entity/account.entity';
import { SortOrderEnum } from 'src/common/enum/sortField.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly commonService: CommonService,
    private readonly uploadFileService: UploadFileService,
    private readonly dataSource: DataSource,
    private readonly userError: UserError,
  ) {}

  async getUserDetail(
    userId: number,
  ): Promise<{ user: GetUserDetailOutputDto; hasTempPassword: boolean }> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { userState: true, account: true, profileImage: true },
      });

      const phoneReplacedUser = user.phone
        ? Object.assign(user, {
            phone: await this.commonService.decrypt(user.phone),
          })
        : user;

      return {
        user: new GetUserDetailOutputDto(phoneReplacedUser),
        hasTempPassword: user.account.isTempPassword,
      };
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.userError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updateUserInfo(
    userId: number,
    body: UpdateUserInfoInputDto,
    file: Express.MulterS3.File,
  ): Promise<GetUserDetailOutputDto> {
    this.logger.log(`updateUserInfo ${userId}, ${body},isWithFile:${!!file}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { userState: true, profileImage: true, account: true },
      });

      if (!user) throw new NotFoundException(USER_ERROR.USER_NOT_FOUND);

      if (body.nickname) {
        const nickNameDuplicatedUser = await this.userRepo.findOne({
          where: { nickname: body?.nickname, id: Not(userId) },
        });

        if (nickNameDuplicatedUser)
          throw new ConflictException(USER_ERROR.USER_NICKNAME_ALREADY_EXIST);
      }

      await queryRunner.startTransaction();

      let profileImage: UploadFile;

      if (file) {
        profileImage = await this.uploadFileService.uploadSingleImageFile(file);
        await queryRunner.manager.save(UploadFile, profileImage);
      }

      if (body.avgHitScore) {
        await queryRunner.manager.update(
          UserState,
          { id: user.userState.id },
          { avgHitScore: body.avgHitScore },
        );
      }

      if (body.password) {
        await queryRunner.manager.update(
          Account,
          { id: user.account.id },
          {
            password: await this.commonService.hash(body.password),
            isTempPassword: false,
          },
        );
      }

      await queryRunner.manager.update(
        User,
        { id: userId },
        {
          nickname: body.nickname,
          birthday: body.birthday,
          gender: body.gender,
          addressMain: body.addressMain,
          addressDetail: body.addressDetail,
          profileImage,
        },
      );

      await queryRunner.commitTransaction();

      const newUser = await this.userRepo.findOne({
        where: { id: userId },
        relations: { account: true, userState: true, profileImage: true },
      });

      const phoneReplacedUser = user.phone
        ? Object.assign(newUser, {
            phone: await this.commonService.decrypt(newUser.phone),
          })
        : newUser;

      return new GetUserDetailOutputDto(phoneReplacedUser);
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.userError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getUserList(query: GetUserListQueryDto): Promise<UserListOutputDto> {
    try {
      const { keyword, sortField, sortOrder, offset, limit } = query;
      const sortOrderValue = SortOrderEnum.value(sortOrder);
      let orderBy = {};

      switch (sortField) {
        case 'age':
          orderBy['birthday'] = sortOrderValue * -1;
          break;
        case 'avgHitScore':
          orderBy['userState'] = { avgHitScore: sortOrderValue };
          break;
        default:
          orderBy['nickname'] = sortOrderValue;
      }

      const [users, totalCount] = await this.userRepo.findAndCount({
        relations: ['userState', 'profileImage', 'account'],
        where: [
          { account: { email: Like(`%${keyword || ''}%`) } },
          { nickname: Like(`%${keyword || ''}%`) },
        ],
        order: orderBy,
        skip: offset,
        take: limit,
      });

      const userList = users.map((user) => new UserOutputDto(user));

      return new UserListOutputDto(totalCount, userList);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.userError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getUser(userId: number): Promise<User> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['profileImage'],
      });

      if (!user) {
        throw new UnauthorizedException(USER_ERROR.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.userError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
