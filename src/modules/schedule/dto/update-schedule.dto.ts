import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateScheduleInputDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '일정 이름', required: false })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '일정 장소', required: false })
  roundingPlace: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '일정 지역 위치', required: false })
  roundingLocation: string;

  @IsDate()
  @IsOptional()
  @ApiProperty({ description: '일정 시작 시간', required: false })
  startTime: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ description: '최대 참여자 수', required: false })
  maxParticipants: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '메모', required: false })
  memo: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '공개 여부', required: false })
  isPrivate: boolean;
}
