import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
} from 'typeorm';

import { ClubUser } from './club-user.entity';
import { ClubUserStateEnum } from '../enum/club.enum';

@Entity()
export class ClubUserState extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ type: 'enum', enum: ClubUserStateEnum })
  @ApiProperty({ description: '클럽 유저 상태' })
  state: ClubUserStateEnum;

  @OneToMany(() => ClubUser, (clubUser) => clubUser.state)
  clubUsers: ClubUser[];
}
