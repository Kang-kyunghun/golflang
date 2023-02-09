import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';

import { UserState } from './entity/user-state.entity';
import { User } from './entity/user.entity';
import { CommonService } from 'src/common/common.service';
import { UpdateUserInfoInputDto } from './dto/update-user-info.dto';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import {
  SearchUsersOutputDto,
  SearchUsersQueryDto,
} from './dto/search-users.dto';
import { GetUserDetailOutputDto } from './dto/get-user-detail.dto';
import { UserError, USER_ERROR } from './error/user.error';
import { Account } from './entity/account.entity';

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

  async searchUsers(query: SearchUsersQueryDto): Promise<SearchUsersOutputDto> {
    try {
      const { keyword } = query;

      const resultQuery = this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.userState', 'userState')
        .innerJoin('user.accounts', 'account')
        .innerJoin('user.profileImage', 'profileImage')
        .select([
          'user.id',
          'user.uid',
          'user.gender',
          'user.birthday',
          'account.email',
          'user.nickname',
          'profileImage.url',
          'userState.avgHitScore',
        ]);

      let result;
      if (keyword) {
        result = await resultQuery
          .where('user.nickname like :nickname', { nickname: `%${keyword}%` })
          .orWhere('account.email like :email', { email: `%${keyword}%` })
          .getManyAndCount();
      } else {
        result = await resultQuery.getManyAndCount();
      }

      const participants = await Promise.all(
        result[0].map(async (v) => {
          return {
            id: v.id,
            profileImage: v.profileImage.url,
            nickname: v.nickname,
            gender: v.gender,
            age: await this.commonService.getAge(v.birthday),
            avgHitScore: v.userState.avgHitScore,
          };
        }),
      );

      return {
        participantCount: result[1],
        participants,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
