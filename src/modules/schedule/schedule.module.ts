import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { User } from '../user/entity/user.entity';
import { Schedule } from './entity/schedule.entity';
import { Account } from '../user/entity/account.entity';
import { Club } from '../club/entity/club.entity';
import { ScheduleType } from './entity/schedule-type.entity';
import { ScheduleError } from './error/schedule.error';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Schedule,
      Account,
      Club,
      ScheduleType
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, JwtService, Logger, ScheduleError],
})
export class ScheduleModule {}
