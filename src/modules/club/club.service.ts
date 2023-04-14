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
  ClubMemberOutPutDto,
} from './dto';
import { Club } from './entity/club.entity';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import { User } from '../user/entity/user.entity';
import { ClubError, CLUB_ERROR } from './error/club.error';
import { Gender } from '../user/enum/user.enum';
import { UserClub } from '../user/entity/user-club.entity';

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
  ): Promise<ClubMemberOutPutDto[]> {
    try {
      const { minAge, maxAge, minHitScore, maxHitScore, gender } = query;

      //한국 나이로 보정
      const maxYear = new Date().getFullYear() - minAge + 2;
      const minYear = new Date().getFullYear() - maxAge + 1;

      const members = await this.userRepo.find({
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
      });

      return members.map((member) => new ClubMemberOutPutDto(member));
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

  async getMyClubList(userId: number): Promise<ClubOutputDto[]> {
    try {
      const clubs = await this.clubRepo.find({
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
      });

      return clubs.map((club) => new ClubOutputDto(club, userId));
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
