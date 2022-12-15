import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RoundingService } from './rounding.service';
import { RoundingController } from './rounding.controller';
import { Rounding } from './entities/rounding.entity';
import { UserRoundingMapping } from './entities/user-rounding-mapping.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { CommonService } from 'src/common/common.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Rounding, UserRoundingMapping, User])],
  controllers: [RoundingController],
  providers: [RoundingService, CommonService, JwtService],
})
export class RoundingModule {}
