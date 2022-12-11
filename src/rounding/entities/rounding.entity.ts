import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Rounding extends CoreEntity {
  @OneToOne(() => User, (user) => user.roundingHost)
  host: User;

  @Column()
  @ApiProperty({ description: '라운딩 장소' })
  place: string;

  @Column()
  @ApiProperty({ description: '라운딩 지역 위치' })
  location: string;

  @Column()
  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '최대 참여자 수' })
  maxParticipant: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모' })
  memo: string;

  @Column({})
  @ApiProperty({ description: '모집중 여부' })
  isGathering: boolean;

  @Column({})
  @ApiProperty({ description: '공개 여부' })
  isOpen: boolean;
}
