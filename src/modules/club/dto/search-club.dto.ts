import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

import { Club } from '../entity/club.entity';

export class SearchClubOutputDto {
  @ApiProperty({ description: '클럽 id' })
  id: number;

  @IsString()
  @ApiProperty({ description: '클럽명' })
  name: string;

  @IsString()
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @IsString()
  @ApiProperty({ description: '클럽소개' })
  introduction: string;

  @IsString()
  @ApiProperty({ description: '클럽 대표 이미지' })
  profileImage: string;

  constructor(club: Club) {
    this.id = club.id;
    this.name = club.name;
    this.introduction = club.introduction;
    this.region = club.region;
    this.profileImage = club.profileImage?.url;
  }
}

export class SearchClubQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  keyword: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '주 활동지역',
    required: false,
  })
  region: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'offset', default: 0, required: false })
  offset: number = 0;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'limit', default: 50, required: false })
  limit: number = 50;
}
