import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { PreParticipation } from './pre-participation.entity';
import { ParticipationType as Type } from '../enum/pre-participation.enum';

@Entity()
export class ParticipationType extends CoreEntity {
  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: '일정타입: 초대 or 참가신청',
    enum: Type,
  })
  type: Type;

  @OneToMany(
    () => PreParticipation,
    (preParticipation) => preParticipation.type,
  )
  preParticipations: PreParticipation[];
}
