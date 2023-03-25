import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { ParticipationType } from './participation-type.entity';
import { ParticipationState } from './participation-state.entity';

@Entity()
export class PreParticipation extends CoreEntity {
  @ManyToOne(() => User, (user) => user.preParticipations)
  @JoinColumn()
  gestUser: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.preParticipations)
  @JoinColumn()
  schedule: Schedule;

  @ManyToOne(
    () => ParticipationType,
    (participationType) => participationType.preParticipations,
  )
  @JoinColumn()
  type: number;

  @ManyToOne(
    () => ParticipationState,
    (participationState) => participationState.preParticipations,
  )
  @JoinColumn()
  state: number;
}
