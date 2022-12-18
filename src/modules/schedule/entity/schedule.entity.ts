import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RoundingScheduleType } from '../enum/schedule.enum';
import { UserScheduleMapping } from './user-schedule-mapping.entity';

@Entity()
export class Schedule extends CoreEntity {
  @Column()
  @ApiProperty({ description: '라운딩 이름' })
  roundingName: string;

  @Column()
  @ApiProperty({ description: '라운딩 장소' })
  roundingPlace: string;

  @Column()
  @ApiProperty({ description: '라운딩 지역 위치' })
  roundingLocation: string;

  @Column()
  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '최대 참여자 수', nullable: true, default: null })
  maxParticipant: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모', nullable: true, default: null })
  memo: string;

  @Column({ default: true })
  @ApiProperty({ description: '공개 여부', default: true })
  isOpen: boolean;

  @Column({
    type: 'enum',
    enum: RoundingScheduleType,
    default: RoundingScheduleType.PERSONAL,
  })
  @ApiProperty({
    description: '라운딩 타입: 개인 or 클럽',
    enum: RoundingScheduleType,
    default: RoundingScheduleType.PERSONAL,
  })
  type: RoundingScheduleType;

  @OneToMany(
    () => UserScheduleMapping,
    (userScheduleMapping) => userScheduleMapping.schedule,
  )
  userScheduleMappings: UserScheduleMapping[];
}
