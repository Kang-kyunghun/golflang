import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/user/entity/user.entity';
import { Account } from 'src/user/entity/account.entity';
import { UserState } from 'src/user/entity/user-state.entity';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, UserState])],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
