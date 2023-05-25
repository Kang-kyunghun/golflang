import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreParticipationService } from './pre-participation.service';
import { PreParticipationController } from './pre-participation.controller';
import { PreParticipation } from './entity/pre-participation.entity';
import { ParticipationType } from './entity/participation-type.entity';
import { ParticipationState } from './entity/participation-state.entity';
import { User } from '../user/entity/user.entity';
import { Account } from '../user/entity/account.entity';
import { Schedule } from '../schedule/entity/schedule.entity';
import { PreParticipationError } from './error/pre-participation.error';
import { AlarmService } from 'src/modules/alarm/alarm.service';
import { Alarm } from '../alarm/entity/alarm.entity';
import { AlarmError } from '../alarm/error/alarm.error';
import { UserError } from './../user/error/user.error';
import { ScheduleError } from './../schedule/error/schedule.error';
import { UserService } from '../user/user.service';
import { ScheduleService } from '../schedule/schedule.service';
import { CommonService } from 'src/common/common.service';
import { UploadFileService } from '../upload-file/upload-file.service';
import { Club } from '../club/entity/club.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PreParticipation,
      ParticipationType,
      ParticipationState,
      Alarm,
      User,
      Club,
      Account,
      Schedule,
    ]),
  ],
  controllers: [PreParticipationController],
  providers: [
    PreParticipationService,
    UserService,
    ScheduleService,
    AlarmService,
    JwtService,
    CommonService,
    UploadFileService,
    Logger,
    AlarmError,
    UserError,
    ScheduleError,
    PreParticipationError,
  ],
})
export class PreParticipationModule {}
