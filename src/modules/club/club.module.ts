import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { User } from '../user/entity/user.entity';
import { Schedule } from '../schedule/entity/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Schedule
    ]),
  ],
  controllers: [ClubController],
  providers: [ClubService]
})
export class ClubModule {}
