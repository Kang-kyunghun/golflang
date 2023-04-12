import {
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';

import { UploadFileService } from '../upload-file/upload-file.service';
import {
  CreateClubInputDto,
  UpdateClubInputDto,
  GetClubMemberListQueryDto,
  ClubOutputDto,
  ClubListOutPutDto,
  ClubMemberOutPutDto,
  ClubMemberListOutPutDto,
  GetMyClubListQueryDto,
} from './dto';
import { Club } from './entity/club.entity';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import { User } from '../user/entity/user.entity';
import { ClubError, CLUB_ERROR } from './error/club.error';
import { Gender } from '../user/enum/user.enum';
import { UserClub } from '../user/entity/user-club.entity';
import { SortOrderEnum } from 'src/common/enum/common.enum';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly uploadFileService: UploadFileService,
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly clubError: ClubError,
  ) {}
  async createClub(
    body: CreateClubInputDto,
    userId: number,
    file?: Express.MulterS3.File,
  ): Promise<ClubOutputDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['profileImage'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const club = new Club();

      club.name = body.name;
      club.region = body.region;
      club.joinCondition = body.joinCondition;
      club.searchKeyword = body.searchKeyword;
      club.introduction = body.introduction;
      club.host = user;

      if (file) {
        const profileImage = await this.uploadFileService.uploadSingleImageFile(
          file,
        );

        await queryRunner.manager.save(UploadFile, profileImage);
        club.profileImage = profileImage;
      }

      await queryRunner.manager.save(Club, club);

      const userClub = new UserClub();
      userClub.user = user;
      userClub.club = club;
      club.userClubs = [userClub];

      await queryRunner.manager.save(UserClub, userClub);
      await queryRunner.commitTransaction();

      return new ClubOutputDto(club, userId);
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(error.message, statusCode);
    } finally {
      await queryRunner.release();
    }
  }

  async getClubDetail(clubId: number, userId: number): Promise<ClubOutputDto> {
    try {
      const club = await this.clubRepo
        .createQueryBuilder('club')
        .innerJoinAndSelect('club.profileImage', 'profileImage')
        .innerJoinAndSelect('club.userClubs', 'userClubs')
        .innerJoinAndSelect('userClubs.user', 'user')
        .leftJoinAndSelect('user.profileImage', 'userProfileImage')
        .leftJoinAndSelect('club.host', 'hostUser')
        .leftJoinAndSelect('hostUser.profileImage', 'hostProfileImage')
        .where('club.id = :clubId', { clubId })
        .getOne();

      if (!club) {
        throw new NotFoundException(CLUB_ERROR.CLUB_NOT_FOUND);
      }

      return new ClubOutputDto(club, userId);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updateClub(
    body: UpdateClubInputDto,
    clubId: number,
    userId: number,
    file?: Express.MulterS3.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const club = await this.clubRepo.findOne({
        where: { id: clubId },
        relations: ['host'],
      });

      if (!club) {
        throw new NotFoundException(CLUB_ERROR.CLUB_NOT_FOUND);
      }

      if (club.host.id !== userId) {
        throw new ForbiddenException(CLUB_ERROR.CLUB_PERMISSION_DENIED);
      }

      const bodyKeys = Object.keys(body);
      const updateData: Partial<Club> = {};

      bodyKeys.forEach((key) => {
        if (body[key] !== undefined) {
          updateData[key] = body[key];
        }
      });

      if (file) {
        const profileImage = await this.uploadFileService.uploadSingleImageFile(
          file,
        );

        await queryRunner.manager.save(UploadFile, profileImage);
        updateData.profileImage = profileImage;
      }

      await queryRunner.manager.update(Club, { id: clubId }, updateData);
      await queryRunner.commitTransaction();

      const updatedClub = await this.clubRepo
        .createQueryBuilder('club')
        .innerJoinAndSelect('club.profileImage', 'profileImage')
        .innerJoinAndSelect('club.userClubs', 'userClubs')
        .innerJoinAndSelect('userClubs.user', 'user')
        .leftJoinAndSelect('user.profileImage', 'userProfileImage')
        .leftJoinAndSelect('club.host', 'hostUser')
        .leftJoinAndSelect('hostUser.profileImage', 'hostProfileImage')
        .where('club.id = :clubId', { clubId })
        .getOne();

      return new ClubOutputDto(updatedClub, userId);
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteClub(clubId: number, userId: number) {
    try {
      const club = await this.clubRepo.findOne({
        where: { id: clubId },
        relations: ['host'],
      });

      if (!club) {
        throw new NotFoundException(CLUB_ERROR.CLUB_NOT_FOUND);
      }

      if (club.host.id !== userId) {
        throw new ForbiddenException(CLUB_ERROR.CLUB_PERMISSION_DENIED);
      }

      await this.clubRepo.softDelete(clubId);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getClubMemberList(
    clubId: number,
    userId: number,
    query: GetClubMemberListQueryDto,
  ): Promise<ClubMemberListOutPutDto> {
    try {
      const {
        minAge,
        maxAge,
        minHitScore,
        maxHitScore,
        gender,
        sortField,
        sortOrder,
        offset,
        limit,
      } = query;
      const sortOrderValue = SortOrderEnum.value(sortOrder);
      let orderBy = {};

      //한국 나이로 보정
      const maxYear = new Date().getFullYear() - minAge + 2;
      const minYear = new Date().getFullYear() - maxAge + 1;

      switch (sortField) {
        case 'nickName':
          orderBy['nickname'] = sortOrderValue;
          break;
        case 'age':
          orderBy['birthday'] = sortOrderValue * -1;
          break;
        case 'clubHitScore':
          orderBy['userClubs'] = { clubHitScore: sortOrderValue };
          break;
        default:
          orderBy['id'] = SortOrderEnum.ASC;
      }

      const [members, totalCount] = await this.userRepo.findAndCount({
        relations: ['userClubs', 'profileImage'],
        where: {
          birthday: Between(minYear.toString(), maxYear.toString()),
          gender: Gender.value(gender),
          userClubs: {
            clubHitScore: Between(minHitScore, maxHitScore),
            club: {
              id: clubId,
            },
          },
        },
        order: orderBy,
        skip: offset,
        take: limit,
      });

      const memberList = members.map(
        (member) => new ClubMemberOutPutDto(member),
      );

      return new ClubMemberListOutPutDto(totalCount, memberList);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async getMyClubList(
    userId: number,
    query: GetMyClubListQueryDto,
  ): Promise<ClubListOutPutDto> {
    try {
      const { sortField, sortOrder, offset, limit } = query;
      const sortOrderValue = SortOrderEnum.value(sortOrder);
      let orderBy = {};

      switch (sortField) {
        case 'name':
          orderBy['name'] = sortOrderValue;
          break;
        case 'mennerScore':
          orderBy['mennerScore'] = sortOrderValue;
          break;
        default:
          orderBy['id'] = SortOrderEnum.ASC;
      }

      const [clubs, totalCount] = await this.clubRepo.findAndCount({
        relations: [
          'profileImage',
          'userClubs',
          'host',
          'host.profileImage',
          'userClubs.user.profileImage',
        ],
        where: {
          userClubs: {
            user: {
              id: userId,
            },
          },
        },
        order: orderBy,
        skip: offset,
        take: limit,
      });

      const clubList = clubs.map((club) => new ClubOutputDto(club, userId));

      return new ClubListOutPutDto(totalCount, clubList);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
