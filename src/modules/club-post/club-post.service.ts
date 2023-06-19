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
import { ClubError, CLUB_ERROR } from '../club/error/club.error';
import {
  ClubPost,
  ClubPostCategory,
  ClubPostImage,
  HandyApproveState,
} from './entity';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import { User } from '../user/entity/user.entity';
import { Club } from '../club/entity/club.entity';
import { ClubPostCategoryEnum, HandyStateEnum } from './enum/club-post.enum';
import { ClubPostError, CLUB_POST_ERROR } from './error/club-post.error';
import {
  ClubPostOutputDto,
  GetClubPostQueryDto,
  CreateClubPostInputDto,
  UpdateClubPostInputDto,
} from './dto';

@Injectable()
export class ClubPostService {
  constructor(
    @InjectRepository(ClubPost)
    private readonly clubPostRepo: Repository<ClubPost>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    private readonly uploadFileService: UploadFileService,
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly clubError: ClubError,
    private readonly clubPostError: ClubPostError,
  ) {}

  async createClubPost(
    body: CreateClubPostInputDto,
    userId: number,
    files?: Express.MulterS3.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const club = await this.clubRepo.findOne({
        where: { id: body.clubId, userClubs: { user: { id: userId } } },
        relations: ['host', 'userClubs.user'],
      });

      //TODO: 권한 확인 로직을 따로 분리 필요할 듯
      //클럽 맴법 권한 확인
      if (!club)
        throw new ForbiddenException(CLUB_ERROR.CLUB_PERMISSION_DENIED);

      //클럽 공지사항일 경우 호스트 여부 확인
      if (
        body.category === ClubPostCategoryEnum.NOTICE &&
        club.host.id !== userId
      )
        throw new ForbiddenException(CLUB_ERROR.CLUB_PERMISSION_DENIED);

      const user = club.userClubs.find(
        (userClub) => userClub.user.id === userId,
      ).user;

      const clubPost = new ClubPost();

      clubPost.category = new ClubPostCategory();
      clubPost.category.id = ClubPostCategoryEnum.id(body.category);
      clubPost.club = club;
      clubPost.user = user;
      clubPost.content = body.content;
      clubPost.images = [];

      await queryRunner.manager.save(clubPost);

      if (!!files.length) {
        const queryBuilder = queryRunner.manager.createQueryBuilder();
        const uploadFiles =
          await this.uploadFileService.uploadMultipleImageFile(files);

        await queryBuilder
          .insert()
          .into(UploadFile)
          .values(uploadFiles)
          .execute();

        const postImages = uploadFiles.map((uploadFile) => {
          const postImage = new ClubPostImage();
          postImage.clubPost = clubPost;
          postImage.clubPostImage = uploadFile;

          return postImage;
        });

        await queryBuilder
          .insert()
          .into(ClubPostImage)
          .values(postImages)
          .execute();

        clubPost.images = postImages;
      }

      if (body.category === ClubPostCategoryEnum.REQUEST_HANDY) {
        clubPost.requestHitScore = body.requestHitScore;
        clubPost.scheduleDate = body.scheduleDate;

        const handyApproveState = new HandyApproveState();
        handyApproveState.state = HandyStateEnum.PENDING;
        handyApproveState.clubPost = clubPost;
        clubPost.handyApproveState = handyApproveState;

        await queryRunner.manager.save(handyApproveState);
      }

      await queryRunner.manager.save(clubPost);
      await queryRunner.commitTransaction();

      return new ClubPostOutputDto(clubPost, userId);
    } catch (error) {
      this.logger.error(error);

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

  async getClubPostList(
    queryParams: GetClubPostQueryDto,
    userId: number,
  ): Promise<ClubPostOutputDto[]> {
    try {
      const { clubId, category, offset, limit } = queryParams;

      const club = await this.clubRepo.findOne({
        where: { id: clubId, userClubs: { user: { id: userId } } },
        relations: ['host', 'userClubs.user'],
      });

      if (!club)
        throw new ForbiddenException(CLUB_ERROR.CLUB_PERMISSION_DENIED);

      const query = this.clubPostRepo
        .createQueryBuilder('clubPost')
        .innerJoinAndSelect('clubPost.club', 'club')
        .innerJoinAndSelect('clubPost.category', 'category')
        .innerJoinAndSelect('clubPost.user', 'user')
        .leftJoinAndSelect('clubPost.handyApproveState', 'handyApproveState')
        .leftJoinAndSelect('clubPost.images', 'image')
        .leftJoinAndSelect('image.clubPostImage', 'clubPostImage')
        .loadRelationCountAndMap(
          'clubPost.commentCount',
          'clubPost.comments',
          'commentCount',
        )
        .loadRelationCountAndMap(
          'clubPost.likeCount',
          'clubPost.likes',
          'likeCount',
        )
        .where('club.id = :clubId', { clubId: club.id })
        .skip(offset)
        .take(limit)
        .orderBy('clubPost.createDate', 'DESC');

      if (category) query.andWhere('category.name = :category', { category });

      const clubPostList = await query.getMany();

      return clubPostList.map(
        (clubPost) => new ClubPostOutputDto(clubPost, userId),
      );
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

  async getClubPostDetail(
    clubPostId: number,
    userId: number,
  ): Promise<ClubPostOutputDto> {
    try {
      const clubPost = await this.clubPostRepo
        .createQueryBuilder('clubPost')
        .innerJoinAndSelect('clubPost.club', 'club')
        .innerJoinAndSelect('clubPost.category', 'category')
        .innerJoinAndSelect('clubPost.user', 'user')
        .leftJoinAndSelect('clubPost.handyApproveState', 'handyApproveState')
        .leftJoinAndSelect('clubPost.images', 'image')
        .leftJoinAndSelect('image.clubPostImage', 'clubPostImage')
        .loadRelationCountAndMap(
          'clubPost.commentCount',
          'clubPost.comments',
          'commentCount',
        )
        .loadRelationCountAndMap(
          'clubPost.likeCount',
          'clubPost.likes',
          'likeCount',
        )
        .where('clubPost.id = :clubPostId', { clubPostId })
        .getOne();

      if (!clubPost)
        throw new NotFoundException(CLUB_POST_ERROR.CLUB_POST_NOT_FOUND);

      return new ClubPostOutputDto(clubPost, userId);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubPostError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async updateClubPost(
    body: UpdateClubPostInputDto,
    clubPostId: number,
    userId: number,
  ) {
    try {
      const clubPost = await this.clubPostRepo.findOne({
        where: { id: clubPostId, user: { id: userId } },
      });

      if (!clubPost) {
        throw new NotFoundException(CLUB_POST_ERROR.CLUB_POST_NOT_FOUND);
      }

      Object.assign(clubPost, body);
      await this.clubPostRepo.save(clubPost);

      const updatedClubPost = await this.clubPostRepo
        .createQueryBuilder('clubPost')
        .innerJoinAndSelect('clubPost.club', 'club')
        .innerJoinAndSelect('clubPost.category', 'category')
        .innerJoinAndSelect('clubPost.user', 'user')
        .leftJoinAndSelect('clubPost.handyApproveState', 'handyApproveState')
        .leftJoinAndSelect('clubPost.images', 'image')
        .leftJoinAndSelect('image.clubPostImage', 'clubPostImage')
        .loadRelationCountAndMap(
          'clubPost.commentCount',
          'clubPost.comments',
          'commentCount',
        )
        .loadRelationCountAndMap(
          'clubPost.likeCount',
          'clubPost.likes',
          'likeCount',
        )
        .where('clubPost.id = :clubPostId', { clubPostId })
        .getOne();

      return new ClubPostOutputDto(updatedClubPost, userId);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubPostError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async deleteClubPost(clubPostId: number, userId: number) {
    try {
      const clubPost = await this.clubPostRepo.findOne({
        where: { id: clubPostId, user: { id: userId } },
      });

      if (!clubPost) {
        throw new NotFoundException(CLUB_POST_ERROR.CLUB_POST_NOT_FOUND);
      }

      await this.clubPostRepo.softDelete(clubPostId);
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.clubPostError.errorHandler(error.message),
        statusCode,
      );
    }
  }
}
