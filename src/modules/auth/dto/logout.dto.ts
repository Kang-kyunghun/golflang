import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutQueryDto {
  @IsString()
  @ApiProperty({ description: '로그아웃하고자 하는 Account uid' })
  accountUid: string;
}
