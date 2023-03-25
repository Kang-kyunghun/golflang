import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';

@Entity()
export class Club extends CoreEntity {
  @Column({ length: 200 })
  @ApiProperty({ description: '클럽명' })
  name: string;

  @Column({ length: 2000 })
  @ApiProperty({ description: '주 활동지역' })
  region: string;

  @Column()
  @ApiProperty({ description: '클럽 총원' })
  memberTotal: number;

  @Column()
  @ApiProperty({ description: '클럽 매너 점수' })
  mennerScore: number;

  @Column({ length: 1000 })
  @ApiProperty({ description: '가입조건' })
  joinCondition: string;

  @Column('simple-array')
  @ApiProperty({ description: '키워드' })
  searchKeyword: string[];

  @Column('text')
  @ApiProperty({ description: '클럽소개' })
  introduction: string;

  @Column({ length: 2000 })
  @ApiProperty({ description: '클럽 대표 이미지' })
  clubProfileImage: string;

  @ManyToOne(() => User, (user) => user.clubs)
  @JoinColumn()
  host: User;

  @OneToMany(() => Schedule, (schedule) => schedule.club)
  schedules: Schedule[];
}
