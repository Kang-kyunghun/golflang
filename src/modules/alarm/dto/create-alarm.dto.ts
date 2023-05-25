import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { AlarmTypeEnum, AlarmContentTypeEnum } from '../enum/alarm.enum';

export class CreateAlarmInputDto {
  @IsEnum(AlarmTypeEnum)
  @ApiProperty({
    description: '알람 타입',
    type: 'enum',
    enum: AlarmTypeEnum,
  })
  alarmType: AlarmTypeEnum;

  @IsEnum(AlarmContentTypeEnum)
  @ApiProperty({
    description: '알람 내용',
    type: 'enum',
    enum: AlarmContentTypeEnum,
  })
  alarmContent: AlarmContentTypeEnum;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '요청 또는 초대 스케줄의 id', required: false })
  scheduleId: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: '채팅 상대의 id', required: false })
  chatingUserId: number;
}
