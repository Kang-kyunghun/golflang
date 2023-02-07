import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Account } from './entity/account.entity';
import { CommonService } from 'src/common/common.service';
import { UserState } from './entity/user-state.entity';
import { UploadFileService } from '../upload-file/upload-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, UserState]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_DATE },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, CommonService, UploadFileService, Logger],
  exports: [UserService],
})
export class UserModule {}
