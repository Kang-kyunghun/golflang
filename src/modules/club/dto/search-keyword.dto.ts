import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

import { SearchKeyword } from '../entity/search-keyword.entity';

export class SearchKeywordQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  keyword: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: 'limit', default: 5, required: false })
  limit: number = 5;
}

export class SearchKeywordListOutputDto {
  @IsArray()
  @ApiProperty({ description: '최다 검색 키워드 목록' })
  keywords: string[];

  constructor(searchKeywords: SearchKeyword[]) {
    this.keywords = searchKeywords.map(
      (searchKeyword) => searchKeyword.keyword,
    );
  }
}
