import { Post } from './../post/entity/post.entity';
import { response } from 'express';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
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
import { AUTH_ERROR } from 'src/auth/error/auth.error';

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
    private readonly authError: AuthError,

    private connection: Connection,
    private readonly logger: Logger,
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
        throw new ConflictException(AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST);
      }

      const userNickname = await this.userRepo.findOne({
        where: {
          nickname: body.nickname,
        },
      });

      if (userNickname) {
        throw new ConflictException(AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST);
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
      account.password =
        body.provider === Provider.LOCAL
          ? await this.commonService.hash(body.password)
          : null;
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
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.authError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async login(guard): Promise<LoginOutputDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password, provider, nickname, gender } = guard;

      let account = await this.accountRepo.findOne({
        where: { email },
        relations: {
          user: { userState: true },
        },
      });

      if (provider === Provider.LOCAL) {
        if (!account) {
          throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
        }

        const checkPassword = await bcrypt.compare(password, account.password);

        if (!checkPassword) {
          throw new BadRequestException(AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG);
        }
      } else {
        if (!account) {
          const userState = new UserState();

          await queryRunner.manager.insert(UserState, userState);

          const user = new User();
          user.role = Role.USER;
          user.nickname = nickname;
          user.gender = gender;
          user.userState = userState;

          await queryRunner.manager.insert(User, user);

          account = new Account();
          account.email = email;
          account.provider = provider;
          account.user = user;

          await queryRunner.manager.insert(Account, account);
        }
      }

      await queryRunner.manager.update(
        UserState,
        { id: account.user.userState.id },
        { lastLoginDate: new Date() },
      );

      const payload = {
        id: account.uid,
      };

      await queryRunner.commitTransaction();

      return {
        jwt: this.JwtService.sign(payload),
        account: {
          email: account.email,
          nickname: account.user.nickname,
        },
      };
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.authError.errorHandler(error.message),
        statusCode,
      );
    } finally {
      await queryRunner.release();
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
