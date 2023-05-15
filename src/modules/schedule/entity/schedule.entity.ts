import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { ScheduleType } from './schedule-type.entity';
import { PreParticipation } from 'src/modules/pre-participation/entity/pre-participation.entity';
import { AlarmInformation } from 'src/modules/alarm/entity/alarm-information.entity';

@Entity()
export class Schedule extends CoreEntity {
  @Column()
  @ApiProperty({ description: '일정 이름' })
  title: string;

  @Column()
  @ApiProperty({ description: '일정 장소(골프장)' })
  roundingPlace: string;

  @Column()
  @ApiProperty({ description: '일정 지역 위치' })
  roundingLocation: string;

  @Column()
  @ApiProperty({ description: '일정 시작 시간' })
  startTime: Date;

  @Column({ default: 20 })
  @ApiProperty({ description: '최대 참여자 수', default: 20 })
  maxParticipants: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모', nullable: true, default: null })
  memo: string;

  @Column({ default: true })
  @ApiProperty({ description: '비공개 여부', default: true })
  isPrivate: boolean;

  @ManyToOne(() => ScheduleType, (scheduleType) => scheduleType.schedules)
  @JoinColumn()
  type: ScheduleType;

  @ManyToOne(() => User, (user) => user.hostschedules)
  @JoinColumn()
  hostUser: User;

  @ManyToOne(() => Club, (club) => club.schedules, { nullable: true })
  @JoinColumn()
  club: Club;

  @OneToMany(
    () => PreParticipation,
    (preParticipation) => preParticipation.schedule,
  )
  preParticipations: PreParticipation[];

  @ManyToMany(() => User, (user) => user.schedules)
  @JoinTable({
    name: 'schedules_users',
    joinColumns: [{ name: 'schedule_id' }],
    inverseJoinColumns: [{ name: 'user_id' }],
  })
  users: User[];

  @OneToMany(() => AlarmInformation, (information) => information.schedule)
  alarmInformations: AlarmInformation[];
}
