import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { RoundingType } from '../enum/rounding.enum';

@Entity()
export class Rounding extends CoreEntity {
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
  @ApiProperty({ description: '최대 참여자 수', nullable: true, default: null })
  maxParticipant: number;

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: '메모', nullable: true, default: null })
  memo: string;

  @Column({ default: true })
  @ApiProperty({ description: '공개 여부', default: true })
  isOpen: boolean;

  @Column({ type: 'enum', enum: RoundingType, default: RoundingType.PERSONAL })
  @ApiProperty({
    description: '라운딩 타입: 개인 or 클럽',
    enum: RoundingType,
    default: RoundingType.PERSONAL,
  })
  type: RoundingType;
}
