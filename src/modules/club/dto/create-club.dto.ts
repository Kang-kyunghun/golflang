import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateClubInputDto {
  @IsString()
  @ApiProperty({ description: '클럽 이름' })
  name: string;

  @IsString()
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @IsString()
  @ApiProperty({ description: '가입조건' })
  joinCondition: string;

  @IsString()
  @ApiProperty({ description: '키워드' })
  searchKeyword: string;

  @IsString()
  @ApiProperty({ description: '클럽소개' })
  introduction: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '클럽 대표 이미지',
    type: 'string',
    format: 'binary',
    required: false,
  })
  profileImage?: Express.MulterS3.File;
}
