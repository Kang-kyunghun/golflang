import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
} from 'class-validator';

import { ClubPostCategoryEnum } from '../enum/club-post.enum';

export class CreateClubPostInputDto {
  @IsString()
  @ApiProperty({ description: '클럽 게시글 내용' })
  content: string;

  @IsEnum(ClubPostCategoryEnum)
  @ApiProperty({ description: '게시글 카테고리' })
  category: ClubPostCategoryEnum;

  @IsNumber()
  @ApiProperty({ description: '게시글 작성 클럽의 id' })
  clubId: number;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: '핸디 요청 스케줄 일자', required: false })
  scheduleDate: Date;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '요청 핸디 스코어', required: false })
  requestHitScore: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '클럽 게시글 이미지 목록',
    type: 'string',
    format: 'binary',
    required: false,
  })
  clubPostImages?: Express.MulterS3.File[];
}
