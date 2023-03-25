import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { ScheduleType } from './schedule-type.entity';

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

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '최대 참여자 수', nullable: true, default: null })
  maxParticipants: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모', nullable: true, default: null })
  memo: string;

  @Column({ default: true })
  @ApiProperty({ description: '비공개 여부', default: true })
  isPrivate: boolean;

  @ManyToOne(() => ScheduleType, (scheduleType) => scheduleType.schedules)
  @JoinColumn()
  type: number;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn()
  hostUser: User;

  @ManyToOne(() => Club, (club) => club.schedules, { nullable: true })
  @JoinColumn()
  club: Club;
}
