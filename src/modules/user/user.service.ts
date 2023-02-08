import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

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

@Injectable()
export class UserService {
  constructor(
    private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly commonService: CommonService,
    private readonly uploadFileService: UploadFileService,
    private readonly dataSource: DataSource,
  ) {}

  async getUserDetail(
    userId: number,
  ): Promise<{ user: GetUserDetailOutputDto; hasTempPassword: boolean }> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { userState: true, account: true },
      });

      const { id, nickname, gender, birthday, addressMain, addressDetail } =
        user;

      return {
        user: {
          userId: id,
          nickname,
          gender,
          birthday,
          addressMain,
          addressDetail,
          email: user.account.email,
          photo: user.profileImage?.url,
          avgHitScore: user.userState ? user.userState.avgHitScore : 0,
          mannerScore: user.userState ? user.userState.mannerScore : 0,
          provider: user.account.provider,
        },
        hasTempPassword: user.account.isTempPassword,
      };
    } catch (error) {
      this.logger.log('getUserDetail', error);
    }
  }

  async updateUserInfo(userId: number, body: UpdateUserInfoInputDto, file) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: { userState: true },
      });

      let profileImage;

      if (file) {
        profileImage = await this.uploadFileService.uploadSingleImageFile(file);
        await queryRunner.manager.save(UploadFile, profileImage);
      }

      await queryRunner.manager.update(
        User,
        { id: userId },
        {
          nickname: body.nickname,
          birthday: body.birthday,
          gender: body.gender,
          addressMain: body.address,
          addressDetail: body.addressDetail,
          profileImage,
        },
      );

      await queryRunner.manager.update(
        UserState,
        { id: user.userState.id },
        { avgHitScore: body.avgHitScore },
      );

      await queryRunner.commitTransaction();
      return 'done';
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
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
