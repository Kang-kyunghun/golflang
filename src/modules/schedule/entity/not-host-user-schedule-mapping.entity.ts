import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { InvitationState } from 'src/common/enum/common.enum';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ParticipationState, ParticipationType } from '../enum/schedule.enum';
import { Schedule } from './schedule.entity';

@Entity()
export class NotHostUserScheduleMapping extends CoreEntity {
  @Column({
    type: 'enum',
    enum: ParticipationState,
    default: ParticipationState.PENDING,
  })
  @ApiProperty({
    description: '초대/신청 진행 상태',
    enum: ParticipationState,
    default: ParticipationState.PENDING,
  })
  participationState: ParticipationState;

  @Column({
    type: 'enum',
    enum: ParticipationType,
  })
  @ApiProperty({
    description: '초대 진행 유형',
    enum: ParticipationType,
  })
  participationType: ParticipationType;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  @JoinColumn()
  schedule: Schedule;
}
