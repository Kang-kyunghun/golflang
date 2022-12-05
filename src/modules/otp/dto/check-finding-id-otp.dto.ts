import { ApiProperty, PickType } from '@nestjs/swagger';
import { CheckSignupOtpInputDto } from './check-signup-otp.dto';

export class CheckFindingIdOtpInputDto extends PickType(
  CheckSignupOtpInputDto,
  ['otp', 'phone'],
) {}

export class CheckFindingIdOtpOutputDto {
  @ApiProperty({ description: '찾고자 하는 유저의 이메일' })
  email: string;
}
