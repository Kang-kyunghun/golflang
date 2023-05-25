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
import { CreateClubPostInputDto } from './dto/create-club-post.dto';
import { Club } from '../club/entity/club.entity';
import { ClubPostCategoryEnum, HandyState } from './enum/club-post.enum';
import { ClubPostOutputDto } from './dto/club-post';

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
        handyApproveState.state = HandyState.PENDING;
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
}
