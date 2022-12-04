import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  SendSignupOtpInputDto,
  SendSignupOtpOutputDto,
} from './send-signup-otp.dto';

export class SendFindingIdOtpInputDto extends PickType(SendSignupOtpInputDto, [
  'phone',
]) {}

export class SendFindingIdOtpOutputDto extends PickType(
  SendSignupOtpOutputDto,
  ['expireDate'],
) {}
