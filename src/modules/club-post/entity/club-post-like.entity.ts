import { Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { ClubPost } from './club-post.entity';

@Entity()
export class ClubPostLike extends CoreEntity {
  @ManyToOne(() => ClubPost, (post) => post.likes)
  @JoinColumn()
  clubPost: ClubPost;

  @ManyToOne(() => User, (user) => user.clubPostLikes)
  @JoinColumn()
  user: User;
}
