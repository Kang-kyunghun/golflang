import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber } from 'class-validator';
import { ParticipationTypeEnum } from '../enum/pre-participation.enum';

export class CreatePreParticipationInputDto {
  @IsArray()
  @ApiProperty({ description: '일정 참여 유저 id 목로' })
  guestUserIds: number[];

  @IsNumber()
  @ApiProperty({ description: '참여 일정 id' })
  scheduleId: number;

  @IsEnum(ParticipationTypeEnum)
  @ApiProperty({
    description: '예비 일정 타입',
    enum: ParticipationTypeEnum,
  })
  type: ParticipationTypeEnum;
}
