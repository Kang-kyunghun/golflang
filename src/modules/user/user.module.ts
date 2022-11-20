import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Account } from './entity/account.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { CommonService } from 'src/common/common.service';
import { UserState } from './entity/user-state.entity';
import { UploadFileService } from '../upload-file/upload-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, UserState]),
    JwtModule.register({
      secret: 'jwtConstantsTest1234',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, CommonService, UploadFileService],
  exports: [UserService],
})
export class UserModule {}
