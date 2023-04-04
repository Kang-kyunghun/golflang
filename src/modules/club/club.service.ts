import {
  HttpException,
  HttpStatus,
  NotFoundException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { UploadFileService } from '../upload-file/upload-file.service';
import { ClubOutputDto } from './dto/club.dto';
import { CreateClubInputDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entity/club.entity';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import { User } from '../user/entity/user.entity';
import { ClubError, CLUB_ERROR } from './error/club.error';

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
      club.searchKeyword = body.searchKeyword.split(', ');
      club.introduction = body.introduction;
      club.users = [user];
      club.host = user;

      if (file) {
        const profileImage = await this.uploadFileService.uploadSingleImageFile(
          file,
        );

        await queryRunner.manager.save(UploadFile, profileImage);
        club.profileImage = profileImage;
      }

      await queryRunner.manager.save(Club, club);
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
        .innerJoinAndSelect('club.users', 'user')
        .leftJoinAndSelect('user.profileImage', 'profileImage')
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

  update(id: number, updateClubDto: UpdateClubDto) {
    return `This action updates a #${id} club`;
  }

  remove(id: number) {
    return `This action removes a #${id} club`;
  }
}
