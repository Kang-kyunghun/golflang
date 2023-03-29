import { Logger, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreParticipationService } from './pre-participation.service';
import { PreParticipationController } from './pre-participation.controller';
import { PreParticipation } from './entity/pre-participation.entity';
import { ParticipationType } from './entity/participation-type.entity';
import { ParticipationState } from './entity/participation-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PreParticipation,
      ParticipationType,
      ParticipationState,
    ]),
  ],
  providers: [PreParticipationService],
  controllers: [PreParticipationController],
})
export class PreParticipationModule {}
