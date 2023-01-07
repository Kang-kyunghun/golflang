import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class CreateRoundingInvitationInputDto {
  @IsArray()
  @ApiProperty({ description: '참가자 유저 ID 리스트' })
  targetUserIds: number[];

  @IsNumber()
  @ApiProperty({ description: '일정 ID' })
  scheduleId: number;
}
