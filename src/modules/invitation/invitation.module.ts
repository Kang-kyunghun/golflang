import { Logger, Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { NotHostUserScheduleMapping } from '../schedule/entity/not-host-user-schedule-mapping.entity';
import { Schedule } from '../schedule/entity/schedule.entity';
import { InvitationError } from './error/invitation.error';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, NotHostUserScheduleMapping, Schedule]),
  ],
  controllers: [InvitationController],
  providers: [InvitationService, Logger, InvitationError],
})
export class InvitationModule {}
