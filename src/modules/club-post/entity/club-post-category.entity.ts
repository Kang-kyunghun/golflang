import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  Entity,
} from 'typeorm';

import { ClubPostCategoryEnum } from '../enum/club-post.enum';
import { ClubPost } from './club-post.entity';

@Entity()
export class ClubPostCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ length: 200 })
  @ApiProperty({
    description: '클럽 게시글 카테고리 이름',
    enum: ClubPostCategoryEnum,
  })
  name: ClubPostCategoryEnum;

  @OneToMany(() => ClubPost, (post) => post.category)
  posts: ClubPost[];
}
