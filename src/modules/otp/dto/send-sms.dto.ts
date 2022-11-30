import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { OtpAction } from '../enum/otp.enum';

export class SendSMSInPutDto {
  @IsString()
  @ApiProperty({ description: 'ID를 찾으려는 유저의 핸드폰 번호' })
  phone: string;

  @IsEnum(OtpAction)
  @ApiProperty({ description: 'SMS 문자 인증이 발생한 상황', enum: OtpAction })
  action: string;
}

export class SendSMSOutputDto {
  @ApiProperty({ description: '만료시간' })
  expireDate: Date;
}
