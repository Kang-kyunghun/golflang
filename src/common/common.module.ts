import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CommonController],
  providers: [CommonService, JwtService],
})
export class CommonModule {}
