import { GuardCoreEntity } from '../../../common/entity/guard-core.entity';
import { Column, CreateDateColumn, Entity, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class UserState extends GuardCoreEntity {
  @CreateDateColumn()
  @ApiProperty({ description: '마지막 로그인 시간' })
  lastLoginDate: Date;

  @Column({ nullable: true, default: 0 })
  @ApiProperty({ description: '평균타수', nullable: true, default: 0 })
  avgHitScore: number;

  @Column({ nullable: true, default: 0 })
  @ApiProperty({ description: '매너지수', nullable: true, default: 0 })
  mannerScore: number;

  @Column({ nullable: true, default: 0 })
  @ApiProperty({ description: '위도', nullable: true, default: 0 })
  latitude: number;

  @Column({ nullable: true, default: 0 })
  @ApiProperty({ description: '경도', nullable: true, default: 0 })
  longitude: number;

  @OneToOne(() => User, (user) => user.userState)
  user: User;
}
