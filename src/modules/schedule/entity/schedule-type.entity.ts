import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { ScheduleTypeEnum } from '../enum/schedule.enum';
import { Schedule } from './schedule.entity';

@Entity()
export class ScheduleType extends CoreEntity {
  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: '일정타입: 개인 or 클럽',
    enum: ScheduleTypeEnum,
  })
  type: ScheduleTypeEnum;

  @OneToMany(() => Schedule, (schedule) => schedule.type)
  schedules: Schedule[];
}
