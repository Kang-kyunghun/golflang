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

import { Club } from 'src/modules/club/entity/club.entity';
import { HandyState } from '../enum/club-post.enum';
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

  @IsDate()
  @ApiProperty({ description: '핸디 요청 스케줄 일자' })
  scheduleDate: Date;

  @IsNumber()
  @ApiProperty({ description: '요청 핸디 스코어' })
  requestHitScore: number;

  @IsEnum(HandyState)
  @ApiProperty({ description: '핸디 요청 상태' })
  handyApproveState: HandyState;

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
    this.scheduleDate = clubPost.scheduleDate;
    this.requestHitScore = clubPost.requestHitScore;
    this.handyApproveState = clubPost.handyApproveState?.state;
  }

  private getClubImages(clubImages: ClubPostImage[]) {
    return clubImages.map((clubImage) => clubImage.clubPostImage?.url);
  }
}
