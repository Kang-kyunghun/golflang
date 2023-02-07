import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { BaseGuard } from 'src/common/guard/base.guard';

import { AuthError, AUTH_ERROR } from '../error/auth.error';
import axios from 'axios';
import { Provider } from '../enum/account.enum';

import { AppleJwtTokenPayloadOutputDto } from '../dto/verify-apple-token.dto';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class OAuthLoginGuard extends BaseGuard {
  constructor(
    private readonly authError: AuthError,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handleRequest(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const data: { email: string | null } = { email: null };

      const param = request.params.provider;

      switch (param) {
        case Provider.KAKAO:
          const { kakaoAccessToken } = request.body;

          const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);

          if (!kakaoUserInfo) {
            throw new BadRequestException(AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR);
          }

          data.email = kakaoUserInfo.kakao_account.email;

          break;

        case Provider.APPLE:
          const { appleIdentityToken } = request.body;
          const decodedToken = await this.verifyAppleToken(appleIdentityToken);

          if (!decodedToken) {
            throw new BadRequestException(AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR);
          }

          data.email = decodedToken.email;
          break;

        default:
          throw new BadRequestException(AUTH_ERROR.ACCOUNT_LOGIN_FAILED);
      }

      return data;
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

  async getKakaoUserInfo(kakaoAccessToken: string) {
    try {
      const kakaoUserInfo = await axios.get(
        'https://kapi.kakao.com/v2/user/me',
        { headers: { Authorization: `Bearer ${kakaoAccessToken}` } },
      );
      return kakaoUserInfo.data;
    } catch (error) {
      this.logger.error(error.message);
      throw new UnauthorizedException();
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
      { algorithms: [decodedToken.header.alg] },
    ) as AppleJwtTokenPayloadOutputDto;

    return verifiedDecodedToken;
  }
}
