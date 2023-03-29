import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';

import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { Gender, Role } from '../enum/user.enum';
import { GuardCoreEntity } from '../../../common/entity/guard-core.entity';
import { Account } from './account.entity';
import { UserState } from './user-state.entity';
import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { Club } from 'src/modules/club/entity/club.entity';
import { PreParticipation } from 'src/modules/pre-participation/entity/pre-participation.entity';

@Entity()
export class User extends GuardCoreEntity {
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({ description: '유저 역할', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true, default: null })
  @ApiProperty({
    description: '닉네임 (2~20자 사이)',
    minLength: 2,
    maxLength: 20,
  })
  nickname: string;

  @Column({ nullable: true, default: null })
  @ApiProperty({
    description: '생년월일',
    example: 'YYYY-MM-DD',
    nullable: true,
    default: null,
  })
  birthday: string;

  @Column({ type: 'enum', enum: Gender, nullable: true, default: null })
  @ApiProperty({
    description: '성별',
    enum: Gender,
    nullable: true,
    default: null,
  })
  gender: Gender;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메인 주소', nullable: true, default: null })
  addressMain: string;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '상세 주소', nullable: true, default: null })
  addressDetail: string;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '전화번호', nullable: true, default: null })
  phone: string;

  @OneToOne(() => Account, (account) => account.user, { onDelete: 'CASCADE' })
  account: Account;

  @OneToOne(() => UserState, (userState) => userState.user, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  userState: UserState;

  @OneToOne(() => UploadFile, (uploadFile) => uploadFile.user)
  @JoinColumn()
  profileImage: UploadFile;

  @OneToMany(() => Schedule, (schedule) => schedule.hostUser)
  hostschedules: Schedule[];

  @OneToMany(() => Club, (club) => club.host)
  hostClubs: Club[];

  @OneToMany(
    () => PreParticipation,
    (preParticipation) => preParticipation.gestUser,
  )
  preParticipations: PreParticipation[];

  @ManyToMany(() => Schedule, (schedule) => schedule.users)
  schedules: Schedule[];

  @ManyToMany(() => Club, (club) => club.users)
  clubs: Schedule[];
}
