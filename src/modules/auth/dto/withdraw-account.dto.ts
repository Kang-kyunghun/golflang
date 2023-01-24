import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WithdrawAccountQueryDto {
  @IsString()
  @ApiProperty({ description: '삭제하고자 하는 Account uid' })
  accountUid: string;
}
