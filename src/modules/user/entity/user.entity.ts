import { Schedule } from 'src/modules/schedule/entity/schedule.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UploadFile } from 'src/modules/upload-file/entity/upload-file.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Gender, Role } from '../enum/user.enum';
import { GuardCoreEntity } from '../../../common/entity/guard-core.entity';
import { Account } from './account.entity';
import { UserState } from './user-state.entity';
import { UserScheduleMapping } from 'src/modules/schedule/entity/user-schedule-mapping.entity';

@Entity()
export class User extends GuardCoreEntity {
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @ApiProperty({ description: '유저 역할', enum: Role, default: Role.USER })
  role: Role;

  @Column()
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

  @Column({ type: 'enum', enum: Gender })
  @ApiProperty({ description: '성별', enum: Gender })
  gender: Gender;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메인 주소', nullable: true, default: null })
  address: string;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '상세 주소', nullable: true, default: null })
  addressDetail: string;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '전화번호', nullable: true, default: null })
  phone: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToOne(() => UserState, (userState) => userState.user)
  @JoinColumn()
  userState: UserState;

  @OneToOne(() => UploadFile, (uploadFile) => uploadFile.userProfileImage)
  @JoinColumn()
  profileImage: UploadFile;

  @OneToMany(
    () => UserScheduleMapping,
    (userScheduleMapping) => userScheduleMapping.hostUser,
  )
  scheduleHostUsers: UserScheduleMapping[];

  @OneToMany(
    () => UserScheduleMapping,
    (userScheduleMapping) => userScheduleMapping.targetUser,
  )
  scheduleTargerUsers: UserScheduleMapping[];

  @OneToMany(() => Schedule, (schedule) => schedule.hostUser)
  schedules: Schedule[];
}
