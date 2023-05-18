import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { AlarmType } from './alarm-type.entity';
import { AlarmInformation } from './alarm-information.entity';

@Entity()
export class Alarm extends CoreEntity {
  @Column()
  @ApiProperty({ description: '알람 내용' })
  content: string;

  @ManyToOne(() => User, (user) => user.alarms)
  @JoinColumn()
  user: User;

  @ManyToOne(() => AlarmType, (type) => type.alarms)
  @JoinColumn()
  type: AlarmType;

  @OneToOne(() => AlarmInformation, (information) => information.alarm)
  information: AlarmInformation;
}
