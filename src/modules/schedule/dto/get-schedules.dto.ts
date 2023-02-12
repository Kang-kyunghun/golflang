import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsString, IsNumber } from 'class-validator';
import { Schedule } from '../entity/schedule.entity';
import { ScheduleType } from '../enum/schedule.enum';

export class GetSchedulesOutputDto {
  @ApiProperty({ description: '스케쥴 id' })
  id: number;

  @IsBoolean()
  @ApiProperty({ description: '주최자 여부' })
  isHost: boolean;

  @IsEnum(ScheduleType)
  @ApiProperty({ description: '주최자 여부' })
  scheduleType: ScheduleType;

  @IsString()
  @ApiProperty({ description: '일정 이름' })
  title: string;

  @IsString()
  @ApiProperty({ description: '일정 라운딩 위치' })
  roundingLocation: string;

  @IsDate()
  @ApiProperty({ description: '라운딩 시작 시간' })
  startTime: Date;

  @IsNumber()
  @ApiProperty({ description: '라운딩 참가자 수' })
  participantCount: number;

  constructor(
    schedule: Schedule,
    selfUserId: number,
    participantCount: number,
  ) {
    this.id = schedule?.id;
    this.isHost = schedule.hostUser?.id === selfUserId;
    this.scheduleType = schedule.type;
    this.title = schedule.title;
    this.roundingLocation = schedule.roundingLocation;
    this.startTime = schedule.startTime;
    this.participantCount = participantCount;
  }
}

export class GetSchedulesQueryDto {
  @IsString()
  @ApiProperty({
    description: '조회하고자 하는 날짜(년월)',
    example: 'YYYY-MM',
  })
  date: string;
}
