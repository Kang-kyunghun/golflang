import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Column,
  Entity,
  JoinColumn
} from 'typeorm';

import { ClubPost } from './club-post.entity';
import { HandyState } from '../enum/hand_state'

@Entity()
export class HandyApproveState extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ type: 'enum', enum: HandyState })
  @ApiProperty({ description: '요청 타수 인정 상태' })
  state: HandyState;

  @ManyToOne(() => ClubPost, (clubPost) => clubPost.handyApproveState)
  @JoinColumn()
  @ApiProperty({ description: '클럽 게시글' })
  clubPost: ClubPost;
}
