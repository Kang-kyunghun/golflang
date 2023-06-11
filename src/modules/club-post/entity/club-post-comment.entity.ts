import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ClubPost } from './club-post.entity';

@Entity()
export class ClubPostComment extends CoreEntity {
  @ManyToOne(() => ClubPost, (post) => post.comments)
  @JoinColumn()
  clubPost: ClubPost;

  @Column({ length: 1000 })
  @ApiProperty({ description: '게시글 댓글' })
  content: string;

  @ManyToOne(() => User, (user) => user.clubPostComments)
  @JoinColumn()
  user: User;

  @ManyToOne(() => ClubPostComment, (comment) => comment.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  parent: ClubPostComment;

  @OneToMany(() => ClubPostComment, (comment) => comment.parent)
  children: ClubPostComment[];
}
