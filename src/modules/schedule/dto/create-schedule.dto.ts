import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Schedule } from '../entity/schedule.entity';
import { ScheduleType } from '../enum/schedule.enum';

export class CreateScheduleInputDto {
  @IsString()
  @ApiProperty({ description: '일정 이름' })
  title: string;

  @IsString()
  @ApiProperty({ description: '일정 장소' })
  roundingPlace: string;

  @IsString()
  @ApiProperty({ description: '일정 지역 위치' })
  roundingLocation: string;

  @IsDate()
  @ApiProperty({ description: '일정 시작 시간' })
  startTime: Date;

  @IsNumber()
  @ApiProperty({ description: '최대 참여자 수' })
  maxParticipants: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '메모' })
  memo: string;

  @IsBoolean()
  @ApiProperty({ description: '공개 여부' })
  isPrivate: boolean;

  @IsEnum(ScheduleType)
  @ApiProperty({ description: '개인 or 클럽' })
  scheduleType: ScheduleType;
}

export class CreateScheduleOutput extends CreateScheduleInputDto {
  constructor(schedule: Schedule) {
    super();
    this.isPrivate = schedule.isPrivate;
    this.maxParticipants = schedule.maxParticipants;
    this.memo = schedule.memo;
    this.roundingLocation = schedule.roundingLocation;
    this.roundingPlace = schedule.roundingPlace;
    this.scheduleType = schedule.type;
    this.startTime = schedule.startTime;
    this.title = schedule.title;
  }
}
