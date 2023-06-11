import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  Column,
  Entity,
  JoinColumn,
} from 'typeorm';

import { ClubPost } from './club-post.entity';
import { HandyStateEnum } from '../enum/club-post.enum';

@Entity()
export class HandyApproveState extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ type: 'enum', enum: HandyStateEnum })
  @ApiProperty({ description: '요청 타수 인정 상태' })
  state: HandyStateEnum;

  @OneToOne(() => ClubPost, (clubPost) => clubPost.handyApproveState)
  @JoinColumn()
  @ApiProperty({ description: '클럽 게시글' })
  clubPost: ClubPost;
}
