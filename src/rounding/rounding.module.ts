import { Module } from '@nestjs/common';
import { RoundingService } from './rounding.service';
import { RoundingController } from './rounding.controller';

@Module({
  controllers: [RoundingController],
  providers: [RoundingService]
})
export class RoundingModule {}
