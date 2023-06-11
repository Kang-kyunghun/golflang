import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDate,
  IsObject,
} from 'class-validator';

import { ClubPostCategoryEnum, HandyStateEnum } from '../enum/club-post.enum';
import { ClubPost, ClubPostImage } from '../entity';

export class ClubPostOutputDto {
  @ApiProperty({ description: '클럽 게시글 id' })
  id: number;

  @IsString()
  @ApiProperty({ description: '게시글 카테고리' })
  category: string;

  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsArray()
  @ApiProperty({ description: '게시글 이미지 목록' })
  clubPostImages: string[];

  @IsObject()
  @ApiProperty({ description: '게시글 작성자' })
  writer: object;

  @IsBoolean()
  @ApiProperty({ description: '본인 작성 여부' })
  isWriter: boolean;

  @IsDate()
  @ApiProperty({ description: '핸디 요청 스케줄 일자' })
  scheduleDate: Date;

  @IsNumber()
  @ApiProperty({ description: '요청 핸디 스코어' })
  requestHitScore: number;

  @IsEnum(HandyStateEnum)
  @ApiProperty({ description: '핸디 요청 상태' })
  handyApproveState: HandyStateEnum;

  @IsNumber()
  @ApiProperty({ description: '총 댓글 수' })
  commentCount: number;

  @IsNumber()
  @ApiProperty({ description: '총 공감 수' })
  likeCount: number;

  constructor(clubPost: ClubPost, userId: number) {
    this.id = clubPost.id;
    this.category = clubPost.category.name;
    this.content = clubPost.content;
    this.clubPostImages = this.getClubImages(clubPost.images);
    this.writer = {
      id: clubPost.user?.id,
      nickname: clubPost.user?.nickname,
      profileImage: clubPost.user?.profileImage?.url,
    };
    this.isWriter = userId === clubPost.user?.id;
    this.scheduleDate = clubPost.scheduleDate;
    this.requestHitScore = clubPost.requestHitScore;
    this.handyApproveState = clubPost.handyApproveState?.state;
    this.commentCount = clubPost.commentCount || 0;
    this.likeCount = clubPost.likeCount || 0;
  }

  private getClubImages(clubImages: ClubPostImage[]) {
    return clubImages.map((clubImage) => clubImage.clubPostImage?.url);
  }
}

export class GetClubPostQueryDto {
  @IsNumber()
  @ApiProperty({
    description: '클럽 id',
    required: true,
  })
  clubId: number;

  @IsEnum(ClubPostCategoryEnum)
  @IsOptional()
  @ApiProperty({
    description: '클럽 게시물 카테고리',
    enum: ClubPostCategoryEnum,
    required: false,
  })
  category: ClubPostCategoryEnum;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'offset', default: 0, required: false })
  offset: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'limit', default: 20, required: false })
  limit: number = 20;
}
