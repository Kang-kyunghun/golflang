import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RoundingScheduleType } from '../enum/schedule.enum';
import { NotHostUserScheduleMapping } from './not-host-user-schedule-mapping.entity';

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
  maxParticipant: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모', nullable: true, default: null })
  memo: string;

  @Column({ default: true })
  @ApiProperty({ description: '비공개 여부', default: true })
  isPrivate: boolean;

  @Column({
    type: 'enum',
    enum: RoundingScheduleType,
    nullable: true,
    default: null,
  })
  @ApiProperty({
    description: '일정타입: 개인 or 클럽',
    enum: RoundingScheduleType,
    nullable: true,
    default: null,
  })
  type: RoundingScheduleType;

  @OneToMany(
    () => NotHostUserScheduleMapping,
    (userScheduleMapping) => userScheduleMapping.schedule,
  )
  notHostUserScheduleMappings: NotHostUserScheduleMapping[];

  @ManyToOne(() => User, (user) => user)
  @JoinColumn()
  hostUser: User;
}
