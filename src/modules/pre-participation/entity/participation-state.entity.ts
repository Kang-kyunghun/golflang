import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { PreParticipation } from './pre-participation.entity';
import { ParticipationStateEnum as State } from '../enum/pre-participation.enum';

@Entity()
export class ParticipationState extends CoreEntity {
  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: '참가상태: 보류 or 허가 or 거절',
    enum: State,
  })
  state: State;

  @OneToMany(
    () => PreParticipation,
    (preParticipation) => preParticipation.state,
  )
  preParticipations: PreParticipation[];
}
