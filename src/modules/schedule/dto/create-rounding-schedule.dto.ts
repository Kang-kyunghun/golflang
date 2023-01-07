import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoundingScheduleInputDto {
  @IsString()
  @ApiProperty({ description: '라운딩 이름' })
  roundingName: string;

  @IsString()
  @ApiProperty({ description: '라운딩 장소' })
  roundingPlace: string;

  @IsString()
  @ApiProperty({ description: '라운딩 지역 위치' })
  roundingLocation: string;

  @IsString()
  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @IsNumber()
  @ApiProperty({ description: '최대 참여자 수' })
  maxParticipant: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '메모' })
  memo: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: '공개 여부' })
  isOpen: boolean;
}
