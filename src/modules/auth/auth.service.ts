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

import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { LessThan, Repository, DataSource } from 'typeorm';
import { Account } from 'src/modules/user/entity/account.entity';
import { UserState } from 'src/modules/user/entity/user-state.entity';
import { CommonService } from 'src/common/common.service';
import { JwtService } from '@nestjs/jwt';

import { Role } from 'src/modules/user/enum/user.enum';
import {
  LocalLoginInputDto,
  LoginOutputDto,
} from 'src/modules/auth/dto/login-dto';
import { AuthError, AUTH_ERROR } from 'src/modules/auth/error/auth.error';
import { UploadFileService } from '../upload-file/upload-file.service';
import { UploadFile } from '../upload-file/entity/upload-file.entity';
import {
  CheckNicknameInputDto,
  CheckNicknameOutputDto,
} from '../user/dto/check-nickname.dto';
import { Provider } from './enum/account.enum';

import {
  RefreshTokenOutputDto as AcessTokenOutputDto,
  RefreshTokenQueryDto as AccessTokenQueryDto,
} from './dto/refresh-token.dto';
import { SignupInputDto } from '../user/dto/signup-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly authError: AuthError,
    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
    private readonly uploadFileService: UploadFileService,
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {}

  async signup(
    body: SignupInputDto,
    file?: Express.MulterS3.File,
  ): Promise<LoginOutputDto> {
    this.logger.log(`[singUp] info:${JSON.stringify(body)}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const duplicatedAccount = await this.accountRepo.findOne({
        where: { email: body.email },
      });

      if (duplicatedAccount)
        throw new ConflictException(AUTH_ERROR.ACCOUNT_EMAIL_ALREADY_EXIST);

      if (body.nickname) {
        const nickNameDuplicatedUser = await this.userRepo.findOne({
          where: { nickname: body?.nickname },
        });

        if (nickNameDuplicatedUser)
          throw new ConflictException(
            AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST,
          );
      }

      if (body.phone) {
        const phoneDuplicatedUser = await this.userRepo.findOne({
          where: {
            phone: await this.commonService.encrypt(body.phone),
          },
        });

        if (phoneDuplicatedUser)
          throw new ConflictException(AUTH_ERROR.ACCOUNT_PHONE_ALREADY_EXIST);
      }

      const user = new User();
      user.role = Role.USER;
      user.nickname = body.nickname;
      user.birthday = body.birthday;
      user.gender = body.gender;
      user.addressMain = body.addressMain;
      user.addressDetail = body.addressDetail;
      user.phone = await this.commonService.encrypt(body.phone);

      if (file) {
        const profileImage = await this.uploadFileService.uploadSingleImageFile(
          file,
        );
        await queryRunner.manager.save(UploadFile, profileImage);
        user.profileImage = profileImage;
      }

      await queryRunner.manager.save(User, user);

      const userState = new UserState();
      userState.user = user;
      userState.avgHitScore = body.avgHitScore;

      await queryRunner.manager.save(UserState, userState);

      const account = new Account();
      account.user = user;
      account.email = body.email;
      account.password = await this.commonService.hash(body.password);
      account.provider = Provider.LOCAL;

      await queryRunner.manager.save(Account, account);

      await queryRunner.commitTransaction();

      return this.loginLocal({ email: body.email, password: body.password });
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

  async loginLocal(body: LocalLoginInputDto): Promise<LoginOutputDto> {
    this.logger.log(`[loginLocal] info: ${JSON.stringify(body)}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, password } = body;

      const userAccount = await this.accountRepo.findOne({
        where: { email },
        relations: { user: { userState: true } },
      });

      if (!userAccount)
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);

      // 비번 체크
      const isPasswordMatched = await bcrypt.compare(
        password,
        userAccount.password,
      );

      if (!isPasswordMatched)
        throw new BadRequestException(AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG);

      const { accessToken, refreshToken } = this.getTokens({
        id: userAccount.uid,
      });

      await queryRunner.manager.update(
        Account,
        { id: userAccount.id },
        { refreshToken },
      );

      await queryRunner.commitTransaction();

      return { accessToken, refreshToken };
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

  async loginOAuth(
    guard: { email: string },
    params: { provider: Provider.APPLE | Provider.KAKAO },
  ): Promise<LoginOutputDto> {
    this.logger.log(`[loginOAuth] email: ${guard.email}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email } = guard;
      const { provider } = params;

      let account = await this.accountRepo.findOne({
        where: { provider, email },
        relations: { user: { userState: true } },
      });

      // 없으면 회원가입 진행
      if (!account) {
        const userState = new UserState();
        await queryRunner.manager.save(UserState, userState);

        const user = new User();
        user.role = Role.USER;
        user.userState = userState;

        await queryRunner.manager.save(User, user);

        account = new Account();
        account.email = email;
        account.provider = provider;
        account.user = user;

        await queryRunner.manager.save(Account, account);
      }

      const { accessToken, refreshToken } = this.getTokens({
        id: account.uid,
      });

      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { refreshToken },
      );

      await queryRunner.commitTransaction();

      return { accessToken, refreshToken };
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
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.authError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  async accessToken(
    query: AccessTokenQueryDto,
  ): Promise<AcessTokenOutputDto | any> {
    if (!query.refreshToken) {
      throw new UnauthorizedException(AUTH_ERROR.REFRESH_TOKEN_NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { refreshToken } = query;
      const decodedRefreshToken: any = this.jwtService.decode(refreshToken);

      const account = await this.accountRepo.findOne({
        where: { uid: decodedRefreshToken.id },
        relations: { user: { userState: true } },
      });

      if (!account) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
      }

      const isValidRefreshToken =
        this.commonService.refreshTokenExpireCheck(refreshToken);

      // refreshToken이 만료됐을 경우
      if (!isValidRefreshToken) {
        throw new UnauthorizedException(AUTH_ERROR.REFRESH_TOKEN_EXPIRED);
      }

      // refreshToken이 만료되지 않았을 경우
      await queryRunner.commitTransaction();

      const payload = { accountUid: decodedRefreshToken.id };
      // accessToken만 반환
      return { accessToken: this.commonService.createAccessToken(payload) };
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

  async withdrawAccount(userId: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await this.accountRepo.findOne({
        where: { user: { id: userId } },
        relations: { user: { userState: true } },
      });

      if (!account) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
      }

      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { isActive: false },
      );

      await queryRunner.manager.update(
        User,
        { id: userId },
        { isActive: false },
      );

      await queryRunner.manager.update(
        UserState,
        { id: account.user.userState.id },
        { isActive: false },
      );

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);

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

  async logout(userId: number): Promise<boolean> {
    try {
      const account = await this.accountRepo.findOne({
        where: { user: { id: userId } },
        relations: { user: { userState: true } },
      });

      if (!account) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
      }

      await this.accountRepo.update({ id: account.id }, { refreshToken: null });

      return true;
    } catch (error) {
      this.logger.error(error);

      const statusCode = error.response
        ? error.response.statusCode
        : HttpStatus.BAD_REQUEST;

      throw new HttpException(
        this.authError.errorHandler(error.message),
        statusCode,
      );
    }
  }

  getTokens(payload: Record<string, string>) {
    return {
      accessToken: this.commonService.createAccessToken(payload),
      refreshToken: this.commonService.createRefreshToken(payload),
    };
  }
}
