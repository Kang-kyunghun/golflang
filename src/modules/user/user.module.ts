import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';
import { Account } from './entity/account.entity';
import { CommonService } from 'src/common/common.service';
import { UserState } from './entity/user-state.entity';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UserError } from './error/user.error';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, UserState])],
  controllers: [UserController],
  providers: [UserService, CommonService, UploadFileService, Logger, UserError],
  exports: [UserService],
})
export class UserModule {}
