import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ParticipationStateEnum } from '../enum/pre-participation.enum';

export class UpdatePreParticipationStateInputDto {
  @IsEnum(ParticipationStateEnum)
  @ApiProperty({
    description: '예비 일정 타입',
    enum: ParticipationStateEnum,
  })
  state: ParticipationStateEnum;
}
