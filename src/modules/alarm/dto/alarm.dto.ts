import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsObject,
} from 'class-validator';

import { AlarmType } from '../entity/alarm-type.entity';
import { AlarmTypeEnum } from '../enum/alarm.enum';
import { Alarm } from '../entity/alarm.entity';
import { User } from 'src/modules/user/entity/user.entity';

export class AlarmOutputDto {
  @ApiProperty({ description: '알람 id' })
  id: number;

  @IsString()
  @ApiProperty({ description: '알람 내용' })
  content: string;

  @IsObject()
  @ApiProperty({ description: '알람 수신자' })
  user: object;

  @IsEnum(AlarmTypeEnum)
  @ApiProperty({ description: '알람 타입' })
  type: AlarmType;

  @IsOptional()
  @IsObject()
  @ApiProperty({ description: '알람 추가 정보' })
  information: object;

  constructor(alarm: Alarm, user: User) {
    this.id = alarm.id;
    this.content = alarm.content;
    this.user = {
      id: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage?.url,
    };
    this.type = alarm.type;
    this.information = {
      chatingUser: alarm.information?.user,
      schedule: alarm.information?.schedule,
    };
  }
}
