import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { ClubUser } from 'src/modules/club/entity/club-user.entity';
import { ClubPost } from 'src/modules/club-post/entity/club-post.entity';
import { ClubMatching } from 'src/modules/club-matching/entity/club-matching.entity';

@Entity()
export class Club extends CoreEntity {
  @Column({ length: 200 })
  @ApiProperty({ description: '클럽명' })
  name: string;

  @Column({ length: 2000 })
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @Column({ default: 0 })
  @ApiProperty({ description: '클럽 매너 점수' })
  mennerScore: number;

  @Column({ length: 1000 })
  @ApiProperty({ description: '가입조건' })
  joinCondition: string;

  @Column()
  @ApiProperty({ description: '키워드' })
  searchKeyword: string;

  @Column('text')
  @ApiProperty({ description: '클럽소개' })
  introduction: string;

  @OneToOne(() => UploadFile, (uploadFile) => uploadFile.club)
  @JoinColumn()
  profileImage: UploadFile;

  @ManyToOne(() => User, (user) => user.hostClubs)
  @JoinColumn()
  host: User;

  @OneToMany(() => Schedule, (schedule) => schedule.club)
  schedules: Schedule[];

  @OneToMany(() => ClubUser, (clubUser) => clubUser.club)
  clubUsers: ClubUser[];

  @OneToMany(() => ClubPost, (clubPost) => clubPost.club)
  posts: ClubPost[];

  @OneToMany(() => ClubMatching, (matching) => matching.requestClub)
  requetMatchings: ClubMatching[];

  @OneToMany(() => ClubMatching, (matching) => matching.invitedClub)
  invitedMatchings: ClubMatching[];
}
