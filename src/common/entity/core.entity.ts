import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @Column({ default: true })
  @ApiProperty({ description: '활성화 여부', default: true })
  isActive: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: '생성 시간' })
  createDate: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '업데이트 시간' })
  updateDate: Date;
}
