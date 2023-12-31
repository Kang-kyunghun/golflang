import { UserError } from './../user/error/user.error';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { User } from 'src/modules/user/entity/user.entity';
import { Account } from 'src/modules/user/entity/account.entity';
import { UserState } from 'src/modules/user/entity/user-state.entity';
import { UserService } from 'src/modules/user/user.service';

import { PassportModule } from '@nestjs/passport';
import { CommonService } from 'src/common/common.service';
import { AuthService } from './auth.service';
import { AuthError } from './error/auth.error';
import { UploadFileService } from '../upload-file/upload-file.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Account, UserState]),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    CommonService,
    AuthService,
    Logger,
    AuthError,
    UserError,
    UploadFileService,
  ],
  exports: [UserService, AuthError],
})
export class AuthModule {}
