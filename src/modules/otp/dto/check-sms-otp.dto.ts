import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { OtpAction } from '../enum/otp.enum';

export class CheckSMSOTPInputDto {
  @IsString()
  @ApiProperty({ description: 'OTP 번호' })
  otp: string;

  @IsEnum(OtpAction)
  @ApiProperty({ description: 'SMS 문자 인증이 발생한 상황', enum: OtpAction })
  action: string;

  @IsEmail()
  @ApiProperty({ description: '유저 이메일' })
  email: string;
}

export class CheckSMSOTPOutputDto {
  @ApiProperty({
    description: '인증 결과: 아이디 찾기 - email 반환, 회원가입 - done 반환',
  })
  result: string;
}
