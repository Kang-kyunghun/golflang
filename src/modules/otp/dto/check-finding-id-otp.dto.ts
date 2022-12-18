import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CheckSignupOtpInputDto } from './check-signup-otp.dto';

export class CheckFindingIdOtpInputDto {
  @IsString()
  @ApiProperty({ description: '폰 번호' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'OTP 번호' })
  otp: string;
}

export class CheckFindingIdOtpOutputDto {
  @ApiProperty({ description: '찾고자 하는 유저의 이메일' })
  email: string;
}
