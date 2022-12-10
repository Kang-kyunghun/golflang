import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { User } from '../user/entity/user.entity';
import { Account } from '../user/entity/account.entity';
import { MailError } from './error/mail.error';
import { UserModule } from '../user/user.module';
import { CommonService } from 'src/common/common.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account]), UserModule],
  controllers: [MailController],
  providers: [MailService, MailError, Logger, CommonService, JwtService],
})
export class MailModule {}
