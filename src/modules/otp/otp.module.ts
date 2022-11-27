import { Logger, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { CommonService } from 'src/common/common.service';
import { Otp } from './entities/otp.entity';
import { OtpError } from './error/otp.error';

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp])],
  providers: [OtpService, Logger, CommonService, OtpError],
  controllers: [OtpController],
})
export class OtpModule {}
