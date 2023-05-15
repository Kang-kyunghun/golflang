import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { Alarm } from './alarm.entity';

@Entity()
export class AlarmInformation extends CoreEntity {
  @ManyToOne(() => User, (user) => user.alarmInformations)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Schedule, (schedule) => schedule.alarmInformations)
  @JoinColumn()
  schedule: Schedule;

  @OneToOne(() => Alarm, (alarm) => alarm.information)
  @JoinColumn()
  alarm: Alarm;
}
