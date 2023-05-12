import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender } from '../enum/user.enum';

export class UpdateUserInfoInputDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '닉네임 (2~20자 사이)',
    minLength: 2,
    maxLength: 20,
    required: false,
  })
  nickname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '생년월일',
    example: 'YYYY-MM-DD',
    required: false,
  })
  birthday: string;

  @IsEnum(Gender)
  @IsOptional()
  @ApiProperty({ description: '성별', enum: Gender, required: false })
  gender: Gender;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '메인 주소', required: false })
  addressMain: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '상세 주소', required: false })
  addressDetail: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: '평균 타수',
    nullable: true,
    default: 0,
    required: false,
  })
  avgHitScore: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '비밀번호', required: false })
  password: string;
}
