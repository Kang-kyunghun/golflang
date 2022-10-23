import { ApiProperty } from '@nestjs/swagger';
import { Column, Generated } from 'typeorm';
import { CoreEntity } from './core.entity';

export class GuardCoreEntity extends CoreEntity {
  @Column()
  @Generated('uuid')
  @ApiProperty({ description: 'uid' })
  uid: string;
}
