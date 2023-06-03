import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlarmController } from './alarm.controller';
import { AlarmService } from 'src/modules/alarm/alarm.service';
import { Alarm } from './entity/alarm.entity';
import { AlarmType } from './entity/alarm-type.entity';
import { AlarmInformation } from './entity/alarm-information.entity';
import { User } from '../user/entity/user.entity';
import { Account } from '../user/entity/account.entity';
import { Schedule } from '../schedule/entity/schedule.entity';
import { AlarmError } from './error/alarm.error';
import { UserService } from '../user/user.service';
import { ScheduleService } from '../schedule/schedule.service';
import { CommonService } from 'src/common/common.service';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UserError } from '../user/error/user.error';
import { ScheduleError } from '../schedule/error/schedule.error';
import { Club } from '../club/entity/club.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alarm,
      AlarmType,
      AlarmInformation,
      User,
      Account,
      Schedule,
      Club,
    ]),
  ],
  controllers: [AlarmController],
  providers: [
    AlarmService,
    UserService,
    ScheduleService,
    CommonService,
    UploadFileService,
    JwtService,
    Logger,
    AlarmError,
    UserError,
    ScheduleError,
  ],
})
export class AlarmModule {}
