import { response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Account } from './entity/account.entity';
import { UserState } from './entity/user-state.entity';
import { User } from './entity/user.entity';
import { Provider, Role } from './enum/user.enum';
import { AuthService } from 'src/modules/auth/auth.service';
import { CommonService } from 'src/common/common.service';
import * as bcrypt from 'bcrypt';
import { SignupInputDto, SignupOutputDto } from './dto/signup-dto';
import { LoginInputDto, LoginOutputDto } from './dto/login-dto';
import { UpdateUserInfoInputDto } from './dto/update-user-info.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(UserState)
    private readonly userStateRepo: Repository<UserState>,
    private readonly commonService: CommonService,
    private readonly JwtService: JwtService,
    private connection: Connection,
  ) {}

  async getUserDetail(userId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id: userId,
        },
        relations: {
          userState: true,
          accounts: true,
        },
      });

      const age = await this.commonService.getAge(user.birthday.slice(0, 4));

      return {
        id: user.id,
        // thumbnail,
        nickname: user.nickname,
        email: user.accounts[0].email,
        gender: user.gender,
        age,
        city: user.address.split(' ')[0],
        avgHitScore: user.userState ? user.userState.avgHitScore : 0,
        mannerScore: user.userState ? user.userState.mannerScore : 0,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async updateUserInfo(userId: number, body: UpdateUserInfoInputDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        User,
        { id: userId },
        {
          nickname: body.nickname,
          birthday: body.birthday,
          gender: body.gender,
          address: body.address,
          addressDetail: body.addressDetail,
        },
      );

      await queryRunner.manager.update(
        UserState,
        { user: { id: userId } },
        { avgHitScore: body.avgHitScore },
      );

      await queryRunner.commitTransaction();
      return 'done';
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
