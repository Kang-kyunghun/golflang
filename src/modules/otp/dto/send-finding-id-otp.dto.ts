import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  SendSignupOtpInputDto,
  SendSignupOtpOutputDto,
} from './send-signup-otp.dto';

export class SendFindingIdOtpInputDto {
  @IsString()
  @ApiProperty({ description: '폰 번호' })
  phone: string;
}

export class SendFindingIdOtpOutputDto {
  @ApiProperty({ description: '만료시간' })
  expireDate: Date;
}
