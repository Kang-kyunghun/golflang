import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class UpdateClubPostInputDto {
  @IsString()
  @ApiProperty({ description: '클럽 게시글 내용' })
  content: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: '핸디 요청 스케줄 일자', required: false })
  scheduleDate: Date;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '요청 핸디 스코어', required: false })
  requestHitScore: number;
}
