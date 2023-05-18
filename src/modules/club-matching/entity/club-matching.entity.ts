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
import { ParticipationState } from '../../pre-participation/entity/participation-state.entity';

@Entity()
export class ClubMatching extends CoreEntity {
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

  @ManyToOne(() => User, (user) => user.requestMatchings)
  @JoinColumn()
  requestUser: User;

  @ManyToOne(() => Club, (club) => club.requetMatchings)
  @JoinColumn()
  requestClub: Club;

  @ManyToOne(() => Club, (club) => club.invitedMatchings)
  @JoinColumn()
  invitedClub: Club;

  @ManyToOne(() => ParticipationState)
  @JoinColumn()
  state: ParticipationState;
}
