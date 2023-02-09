import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Gender, Role } from '../enum/user.enum';
import { GuardCoreEntity } from '../../../common/entity/guard-core.entity';
import { Account } from './account.entity';
import { UserState } from './user-state.entity';
import { NotHostUserScheduleMapping as NotHostUserScheduleMapping } from 'src/modules/schedule/entity/not-host-user-schedule-mapping.entity';

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

  @OneToOne(() => UploadFile, (uploadFile) => uploadFile.userProfileImage)
  @JoinColumn()
  profileImage: UploadFile;

  //host가 아닌 참여자인 경우는 mappging 테이블을 거쳐서 관련 일정 검색 가능
  @OneToMany(
    () => NotHostUserScheduleMapping,
    (userScheduleMapping) => userScheduleMapping.guestUser,
  )
  notHostUserScheduleMappings: NotHostUserScheduleMapping[];

  @OneToMany(() => Schedule, (schedule) => schedule.hostUser)
  schedules: Schedule[];
}
