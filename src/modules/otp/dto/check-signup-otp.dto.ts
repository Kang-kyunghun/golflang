import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckSignupOtpInputDto {
  @IsString()
  @ApiProperty({ description: '폰 번호' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'OTP 번호' })
  otp: string;
}

export class CheckSignupOtpOutputDto {
  @ApiProperty({ description: '본인인증 결과' })
  authentication: boolean;
}
