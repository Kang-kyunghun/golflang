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
} from '@nestjs/common';
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
import { LoginOutputDto } from 'src/modules/user/dto/login-dto';
import { AuthError, AUTH_ERROR } from 'src/modules/auth/error/auth.error';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import {
  CheckNicknameInputDto,
  CheckNicknameOutputDto,
} from '../user/dto/check-nickname.dto';
import { Provider } from './enum/account.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(UserState)
    private readonly userStateRepo: Repository<UserState>,

    private readonly authError: AuthError,
    private readonly JwtService: JwtService,
    private readonly commonService: CommonService,
    private readonly uploadFileService: UploadFileService,

    private connection: Connection,
    private readonly logger: Logger,
  ) {}

  async signup(body, file): Promise<SignupOutputDto> {
    const accountEmail = await this.accountRepo.findOne({
      where: { email: body.email },
    });

    if (accountEmail) {
      throw new ConflictException(AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST);
    }

    const userNickname = await this.userRepo.findOne({
      where: { nickname: body.nickname },
    });

    if (userNickname) {
      throw new ConflictException(AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST);
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const profileImage = await this.uploadFileService.uploadSingleImageFile(
        file,
      );
      await queryRunner.manager.save(UploadFile, profileImage);

      const user = new User();
      user.role = Role.USER;
      user.nickname = body.nickname;
      user.birthday = body.birthday;
      user.gender = body.gender;
      user.address = body.address;
      user.addressDetail = body.addressDetail;
      user.profileImage = profileImage;
      user.phone = await this.commonService.encrypt(body.phone);

      await queryRunner.manager.save(User, user);

      const userState = new UserState();
      userState.user = user;
      userState.avgHitScore = body.avgHitScore;

      await queryRunner.manager.save(UserState, userState);

      const account = new Account();
      account.user = user;
      account.email = body.email;
      account.accountKey = `l_${body.email}`;
      account.password = await this.commonService.hash(body.password);
      account.provider = Provider.LOCAL;

      await queryRunner.manager.save(Account, account);

      const payload = { id: account.uid };

      const accessToken = this.commonService.createAccessToken(payload);
      const refreshToken = this.commonService.createRefreshToken(payload);

      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { refreshToken },
      );

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
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

  async loginLocal(body) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password } = body;

      let account = await this.accountRepo.findOne({
        where: { email },
        relations: {
          user: { userState: true },
        },
      });

      if (!account) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
      }

      const checkPassword = await bcrypt.compare(password, account.password);

      if (!checkPassword) {
        throw new BadRequestException(AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG);
      }

      await queryRunner.manager.update(
        UserState,
        { id: account.user.userState.id },
        { lastLoginDate: new Date() },
      );

      const payload = { id: account.uid };
      const accessToken = this.commonService.createAccessToken(payload);

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken: account.refreshToken,
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

  async loginOAuth(guard, body): Promise<LoginOutputDto> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, provider, nickname, gender } = guard;
      const { kakaoAccessToken, kakaoRefreshToken } = body;

      const accountKey = `${provider.slice(0, 1)}_${email}`;

      console.log(1);

      let account = await this.accountRepo.findOne({
        where: { accountKey },
        relations: {
          user: { userState: true },
        },
      });

      if (!account) {
        const userState = new UserState();

        await queryRunner.manager.save(UserState, userState);

        const user = new User();
        user.role = Role.USER;
        user.nickname = nickname;
        user.gender = gender;
        user.userState = userState;

        await queryRunner.manager.save(User, user);

        account = new Account();
        account.email = email;
        account.provider = provider;
        account.user = user;
        account.accountKey = `${provider.slice(0, 1)}_${email}`;

        await queryRunner.manager.save(Account, account);
      }

      await queryRunner.manager.update(
        UserState,
        { id: account.user.userState.id },
        { lastLoginDate: new Date() },
      );

      const payload = { id: account.uid };

      const accessToken = this.commonService.createAccessToken(payload);

      const refreshToken = this.commonService.createRefreshToken({
        id: account.uid,
        refreshToken: kakaoRefreshToken,
      });

      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { refreshToken },
      );

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
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

  async checkNickname(
    body: CheckNicknameInputDto,
  ): Promise<CheckNicknameOutputDto> {
    try {
      const userNickname = await this.userRepo.findOne({
        where: {
          nickname: body.nickname,
        },
      });

      const isDuplicatedNickname = userNickname ? true : false;

      return { isDuplicatedNickname };
    } catch (error) {
      console.error(error);
    }
  }
}
