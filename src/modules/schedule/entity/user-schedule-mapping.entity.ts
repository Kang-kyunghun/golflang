import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { InvitationState } from 'src/common/enum/common.enum';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ParticipationState, ParticipationType } from '../enum/schedule.enum';
import { Schedule } from './schedule.entity';

@Entity()
export class UserScheduleMapping extends CoreEntity {
  @Column({
    type: 'enum',
    enum: ParticipationState,
    default: ParticipationState.PENDING,
  })
  @ApiProperty({
    description: '초대 진행 상태',
    enum: ParticipationState,
    default: ParticipationState.PENDING,
  })
  participationState: ParticipationState;

  @Column({
    type: 'enum',
    enum: ParticipationType,
  })
  @ApiProperty({
    description: '초대 진행 상태',
    enum: ParticipationType,
  })
  participationType: ParticipationType;

  @ManyToOne(() => Schedule, (schedule) => schedule.id)
  @JoinColumn()
  schedule: Schedule;

  @ManyToOne(() => User, (user) => user.scheduleHostUsers)
  @JoinColumn()
  hostUser: User;

  @ManyToOne(() => User, (user) => user.scheduleTargerUsers)
  @JoinColumn()
  targetUser: User;
}
