import { Logger, Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { NotHostUserScheduleMapping } from './entity/not-host-user-schedule-mapping.entity';
import { Schedule } from './entity/schedule.entity';
import { CommonService } from 'src/common/common.service';
import { JwtService } from '@nestjs/jwt';
import { ScheduleError } from './error/schedule.error';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotHostUserScheduleMapping, Schedule]),
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    CommonService,
    JwtService,
    Logger,
    ScheduleError,
  ],
})
export class ScheduleModule {}
