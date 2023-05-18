import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { Alarm } from './alarm.entity';

@Entity()
export class AlarmType extends CoreEntity {
  @Column()
  @ApiProperty({ description: '알람 타입' })
  type: string;

  @OneToMany(() => Alarm, (alarm) => alarm.type)
  alarms: Alarm[];
}
