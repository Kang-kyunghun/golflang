import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/user/entity/account.entity';
import { UserState } from 'src/user/entity/user-state.entity';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CommonService } from 'src/common/common.service';
import { AuthService } from './auth.service';
import { AuthError } from './error/auth.error';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Account, UserState]),
    JwtModule.register({
      secret: 'jwtConstantsTest1234',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [UserService, CommonService, AuthService, Logger, AuthError],
  exports: [UserService, AuthError],
})
export class AuthModule {}
