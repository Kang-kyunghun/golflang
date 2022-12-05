import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendSignupOtpInputDto {
  @IsString()
  @ApiProperty({ description: '폰 번호' })
  phone: string;
}

export class SendSignupOtpOutputDto {
  @ApiProperty({ description: '만료시간' })
  expireDate: Date;
}
