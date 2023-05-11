import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Gender } from '../enum/user.enum';

export class SignupInputDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '로그인 이메일' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*_+=-])[A-Za-z\d~!@#$%^&*_+=-]{8,}$/,
  )
  @ApiProperty({
    description: '비밀번호(알파벳+숫자+특수문자 8자리 이상',
    example: 'abcd1234!',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '전화번호' })
  phone: string;

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
}

class SignupAccountField {
  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;
}

export class SignupOutputDto {
  @ApiProperty({ description: '계정 정보' })
  account: SignupAccountField;
}
