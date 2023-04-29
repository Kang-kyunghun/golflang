import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import {
  ClubPostCategory,
  ClubPostComment,
  ClubPostImage,
  HandyApproveState,
} from './';

@Entity()
export class ClubPost extends CoreEntity {
  @ManyToOne(() => ClubPostCategory, (cateogry) => cateogry.posts)
  @ApiProperty({ description: '게시글이 카테고리' })
  @JoinColumn()
  category: ClubPostCategory;

  @ManyToOne(() => Club, (club) => club.posts)
  @ApiProperty({ description: '게시글이 작성된 클럽' })
  club: Club;

  @ManyToOne(() => User, (user) => user.clubPosts)
  @ApiProperty({ description: '게시글 작성자' })
  user: User;

  @Column({ type: 'text' })
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '요청 타수', nullable: true })
  requestHitScore: number;

  @Column({ nullable: true })
  @ApiProperty({ description: '핸디 요청 스케줄 일정' })
  scheduleDate: Date;

  @OneToMany(() => ClubPostComment, (comment) => comment.clubPost)
  comments: ClubPostComment[];

  @OneToMany(() => ClubPostImage, (clubPostImage) => clubPostImage.clubPost)
  images: ClubPostImage[];

  @OneToMany(() => HandyApproveState, (state) => state.clubPost)
  handyApproveState: HandyApproveState[];
}
