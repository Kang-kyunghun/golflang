import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { ParticipationState } from 'src/modules/schedule/enum/schedule.enum';

export class UpdateRoundingInvitationInputDto {
  @IsEnum(ParticipationState)
  @ApiProperty({
    description: '참가 상태 (승낙 & 거절)',
    enum: ParticipationState,
  })
  participationState: ParticipationState;

  @IsNumber()
  @ApiProperty({ description: 'Schedule ID' })
  scheduleId: number;

  @IsNumber()
  @ApiProperty({ description: 'HostUser ID' })
  hostUserId: number;
}
