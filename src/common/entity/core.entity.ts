import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CoreEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @CreateDateColumn()
  @ApiProperty({ description: '생성 시간' })
  createDate: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '업데이트 시간' })
  updateDate: Date;
}
