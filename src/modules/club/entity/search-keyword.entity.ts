import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

import { CoreEntity } from 'src/common/entity/core.entity';

@Entity()
export class SearchKeyword extends CoreEntity {
  @Column({ length: 200 })
  @ApiProperty({ description: '검색 키워드' })
  keyword: string;

  @Column({ default: 0 })
  @ApiProperty({ description: '키워드 검색 횟수' })
  frequency: number;
}
