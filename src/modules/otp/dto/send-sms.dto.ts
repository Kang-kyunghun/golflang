import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendSMSQueryDto {
  @IsString()
  @ApiProperty({ description: 'ID를 찾으려는 유저의 핸드폰 번호' })
  phone: string;
}

export class SendSMSOutputDto {
  @ApiProperty({ description: '만료시간' })
  expireDate: Date;
}
