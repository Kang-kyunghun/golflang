import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Matches,
} from 'class-validator';

export class UpdateClubInputDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '클럽 이름' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @IsOptional()
  @Matches(/^[a-zA-Z가-힣0-9]+([,][\s]*[a-zA-Z가-힣0-9]+)*$/g)
  @ApiProperty({
    description: `가입조건 (조건이 1개일 때는 ', '가 없고, 1개 이상일 때는 단어 사이에 ', '를 추가하여 조건 구분)`,
  })
  joinCondition: string;

  @IsOptional()
  @Matches(/^[a-zA-Z가-힣0-9]+([,][\s]*[a-zA-Z가-힣0-9]+)*$/g)
  @ApiProperty({
    description: `키워드 (키워드가 1개일 때는 ', '가 없고, 1개 이상일 때는 단어 사이에 ', '를 추가하여 조건 구분)`,
  })
  searchKeyword: string;

  @IsOptional()
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
