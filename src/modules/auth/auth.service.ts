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
import { Connection, LessThan, Repository } from 'typeorm';
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
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { AppleJwtTokenPayloadOutputDto } from './dto/verify-apple-token.dto';

import {
  RefreshTokenOutputDto,
  RefreshTokenQueryDto,
} from './dto/refresh-token.dto';

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
    private readonly jwtService: JwtService,
    private readonly commonService: CommonService,
    private readonly uploadFileService: UploadFileService,

    private connection: Connection,
    private readonly logger: Logger,
  ) {}

  async signup(body, file): Promise<Account> {
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

      let userNickname;
      if (body.nickname) {
        userNickname = await this.userRepo.findOne({
          where: { nickname: body?.nickname },
        });

        if (userNickname) {
          throw new ConflictException(
            AUTH_ERROR.ACCOUNT_NICKNAME_ALREADY_EXIST,
          );
        }
      }

      if (body.phone) {
        const checkPhone = await this.userRepo.findOne({
          where: {
            phone: await this.commonService.encrypt(body.phone),
          },
        });

        if (checkPhone) {
          throw new ConflictException(AUTH_ERROR.ACCOUNT_PHONE_ALREADY_EXIST);
        }
      }

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

      await queryRunner.commitTransaction();

      return account;
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

      // 비번 체크
      const matchPassword = await bcrypt.compare(password, account.password);

      if (!matchPassword) {
        throw new BadRequestException(AUTH_ERROR.ACCOUNT_PASSWORD_WAS_WRONG);
      }

      // 마지막 로그인 시간 업데이트
      await queryRunner.manager.update(
        UserState,
        { id: account.user.userState.id },
        { lastLoginDate: new Date() },
      );

      const payload = { id: account.uid };

      // 로그인할때마다 accessToken 새로 발급 후 프론트에 반환만 해줌
      const newAccessToken = this.commonService.createAccessToken(payload);

      // 로그인할때마다 refreshToken 새로 발급 후 DB 업데이트 및 반환
      const newRefreshToken = this.commonService.createRefreshToken(payload);

      // 기존에 발급된 refreshToken가 있을 경우
      if (account.refreshToken) {
        // 만료기한 체크
        const refreshTokenExpireCheck =
          this.commonService.refreshTokenExpireCheck(account.refreshToken);

        // 만료됐을 경우
        if (!refreshTokenExpireCheck) {
          // 새로 발급한 refreshToken로 업데이트
          await queryRunner.manager.update(
            Account,
            { id: account.id },
            { refreshToken: newRefreshToken },
          );
        } else {
          // 아직 만료되지 않았을 경우 로직 끝내기
          await queryRunner.commitTransaction();

          return {
            accessToken: newAccessToken,
          };
        }
      } else {
        // 기존에 발급된 refreshToken가 없을 경우, 새로 발급한 refreshToken 저장
        await queryRunner.manager.update(
          Account,
          { id: account.id },
          { refreshToken: newRefreshToken },
        );
      }

      await queryRunner.commitTransaction();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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

  async loginOAuth(guard, body): Promise<LoginOutputDto | any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { email, provider, nickname, gender } = guard;
      const { kakaoAccessToken, kakaoRefreshToken, appleIdentityToken } = body;

      const accountKey = `${provider.slice(0, 1)}_${email}`;

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
        user.nickname = nickname ? nickname : null;
        user.gender = gender ? gender : null;
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

  async verifyAppleToken(
    appleIdToken: string,
  ): Promise<AppleJwtTokenPayloadOutputDto> {
    const decodedToken = jwt.decode(appleIdToken, { complete: true }) as {
      header: { kid: string; alg: jwt.Algorithm };
      payload: { sub: string };
    };

    const keyIdFromToken = decodedToken.header.kid;

    const applePublicKeyUrl = 'https://appleid.apple.com/auth/keys';

    const jwksClient = new JwksClient({ jwksUri: applePublicKeyUrl });

    const key = await jwksClient.getSigningKey(keyIdFromToken);
    const publicKey = key.getPublicKey();

    const verifiedDecodedToken: AppleJwtTokenPayloadOutputDto = jwt.verify(
      appleIdToken,
      publicKey,
      {
        algorithms: [decodedToken.header.alg],
      },
    ) as AppleJwtTokenPayloadOutputDto;

    return verifiedDecodedToken;
  }

  async refreshToken(
    query: RefreshTokenQueryDto,
  ): Promise<RefreshTokenOutputDto | any> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const date = new Date();
    const lastLoginUpdateDate = new Date();
    lastLoginUpdateDate.setMinutes(date.getMinutes() - 10);

    try {
      const { refreshToken } = query;

      const decodeRefreshToken: any = this.jwtService.decode(refreshToken);

      const payload = { accountUid: decodeRefreshToken.id };

      const account = await this.accountRepo.findOne({
        where: { uid: decodeRefreshToken.id },
        relations: { user: { userState: true } },
      });

      if (!account) {
        throw new NotFoundException(AUTH_ERROR.ACCOUNT_ACCOUNT_NOT_FOUND);
      }

      // 새로운 accessToken 발급
      const newAccessToken = this.commonService.createAccessToken(payload);

      const refreshTokenExpireCheck =
        this.commonService.refreshTokenExpireCheck(refreshToken);

      // refreshToken이 만료됐을 경우
      if (!refreshTokenExpireCheck) {
        // 새로운 refreshToken 발급
        const newRefreshToken = this.commonService.createRefreshToken(payload);

        // 마지막 로그인 시간 업데이트 후
        await queryRunner.manager.update(
          UserState,
          {
            id: account.user.userState.id,
            lastLoginDate: LessThan(lastLoginUpdateDate),
          },
          { lastLoginDate: new Date() },
        );

        await queryRunner.manager.update(
          Account,
          { id: account.id },
          { refreshToken: newRefreshToken },
        );

        await queryRunner.commitTransaction();
        // accessToken 와 refreshToken 둘 다 반환
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }

      // refreshToken이 만료되지 않았을 경우
      // 마지막 로그인 시간 업데이트 후
      await queryRunner.manager.update(
        UserState,
        {
          id: account.user.userState.id,
          lastLoginDate: LessThan(lastLoginUpdateDate),
        },
        { lastLoginDate: new Date() },
      );

      await queryRunner.commitTransaction();

      // accessToken만 반환
      return {
        accessToken: newAccessToken,
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
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }

  async withdrawAccount(userId: number): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
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
}
