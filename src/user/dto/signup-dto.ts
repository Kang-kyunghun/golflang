import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { User } from '../entity/user.entity';
import { Gender, Provider } from '../enum/user.enum';

export class SignupInputDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: '로그인 이메일' })
  email: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호(알파벳+숫자+특수문자 8자리 이상',
    example: 'abcd1234!',
  })
  password: string;

  @IsString()
  @ApiProperty({ description: '전화번호' })
  phone: string;

  @IsString()
  @ApiProperty({
    description: '닉네임 (2~20자 사이)',
    minLength: 2,
    maxLength: 20,
  })
  nickname: string;

  @IsString()
  @ApiProperty({ description: '생년월일', example: 'YYYY-MM-DD' })
  birthday: string;

  @IsEnum(Gender)
  @ApiProperty({ description: '성별', enum: Gender })
  gender: Gender;

  @IsString()
  @ApiProperty({ description: '메인 주소' })
  address: string;

  @IsString()
  @ApiProperty({ description: '상세 주소' })
  addressDetail: string;

  @IsEnum(Provider)
  @IsNotEmpty()
  @ApiProperty({ description: 'SNS 계정 공급자', enum: Provider })
  provider: Provider;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: '평균 타수', nullable: true, default: 0 })
  avgHitScore: number;
}

class SignupAccountField {
  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '닉네임' })
  nickname: string;
}

export class SignupOutputDto {
  @ApiProperty({ description: 'jwt' })
  jwt: string;

  @ApiProperty({ description: '계정 정보' })
  account: SignupAccountField;
}
