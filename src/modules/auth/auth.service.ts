import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Connection, Repository } from 'typeorm';
import { Account } from 'src/modules/user/entity/account.entity';
import { UserState } from 'src/modules/user/entity/user-state.entity';
import { CommonService } from 'src/common/common.service';
import { JwtService } from '@nestjs/jwt';
import {
  SignupInputDto,
  SignupOutputDto,
} from 'src/modules/user/dto/signup-dto';
import { Role } from 'src/modules/user/enum/user.enum';
import { LoginInputDto, LoginOutputDto } from 'src/modules/user/dto/login-dto';

@Injectable()
export class AuthService {
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

  async signup(body: SignupInputDto): Promise<SignupOutputDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accountEmail = await this.accountRepo.findOne({
        where: { email: body.email },
      });

      if (accountEmail) {
        throw new ConflictException();
      }

      const user = new User();
      user.role = Role.USER;
      user.nickname = body.nickname;
      user.birthday = body.birthday;
      user.gender = body.gender;
      user.address = body.address;
      user.addressDetail = body.addressDetail;
      user.phone = await this.commonService.encrypt(body.phone);

      await queryRunner.manager.save(User, user);

      const userState = new UserState();
      userState.user = user;
      userState.avgHitScore = body.avgHitScore;

      await queryRunner.manager.save(UserState, userState);

      const account = new Account();
      account.email = body.email;
      account.password = await this.commonService.hash(body.password);
      account.user = user;

      await queryRunner.manager.save(Account, account);

      const payload = {
        id: account.uid,
      };

      await queryRunner.commitTransaction();

      return {
        jwt: this.JwtService.sign(payload),
        account: {
          email: account.email,
          nickname: user.nickname,
        },
      };
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async login(body: LoginInputDto): Promise<LoginOutputDto> {
    try {
      const account = await this.accountRepo.findOne({
        where: { email: body.email },
        relations: {
          user: { userState: true },
        },
      });

      if (!account) {
        throw new NotFoundException();
      }

      const loginResult = await bcrypt.compare(body.password, account.password);

      if (!loginResult) {
        throw new BadRequestException();
      }

      // 마지막 로그인 시간 업데이트
      await this.userStateRepo.update(
        { id: account.user.userState.id },
        { lastLoginDate: new Date() },
      );

      const payload = {
        id: account.uid,
      };

      return {
        jwt: this.JwtService.sign(payload),
        account: {
          email: account.email,
          nickname: account.user.nickname,
        },
      };
    } catch (error) {
      console.error(error);
    }
  }

  async checkNickname(body) {
    try {
      const userNickname = await this.userRepo.findOne({
        where: {
          nickname: body.nickname,
        },
      });

      const isAble = !userNickname ? true : false;

      return { isAble };
    } catch (error) {
      console.error(error);
    }
  }
}
