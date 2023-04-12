import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
} from 'typeorm';

import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';

@Entity()
export class UserClub extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.userClubs)
  @ApiProperty({ description: '클럽 회원' })
  user: User;

  @ManyToOne(() => Club, (club) => club.userClubs)
  @ApiProperty({ description: '소속 클럽' })
  club: Club;

  @Column({ default: 0 })
  @ApiProperty({ description: '클럽 인증 타수' })
  clubHitScore: number;
}
