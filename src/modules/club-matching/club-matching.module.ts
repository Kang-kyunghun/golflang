import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClubMatchingService } from './club-matching.service';
import { ClubMatchingController } from './club-matching.controller';
import { ClubMatching } from './entity/club-matching.entity';
import { User } from 'src/modules//user/entity/user.entity';
import { Account } from '../user/entity/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClubMatching, User, Account])],
  providers: [ClubMatchingService],
  controllers: [ClubMatchingController],
})
export class ClubMatchingModule {}
