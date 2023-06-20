import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

import { User } from 'src/modules/user/entity/user.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { ClubUserState } from './club-user-state.entity';
import { CoreEntity } from 'src/common/entity/core.entity';

@Entity()
export class ClubUser extends CoreEntity {
  @ManyToOne(() => User, (user) => user.clubUsers)
  @ApiProperty({ description: '클럽 회원' })
  user: User;

  @ManyToOne(() => Club, (club) => club.clubUsers)
  @ApiProperty({ description: '소속 클럽' })
  club: Club;

  @Column({ default: 0 })
  @ApiProperty({ description: '클럽 인증 타수' })
  clubHitScore: number;

  @ManyToOne(() => ClubUserState, (state) => state.clubUsers)
  @JoinColumn()
  state: ClubUserState;
}
