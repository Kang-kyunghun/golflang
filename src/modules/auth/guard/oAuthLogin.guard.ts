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
import { AuthService } from '../auth.service';
import { SignupInputDto } from 'src/modules/user/dto/signup-dto';

@Injectable()
export class OAuthLoginGuard extends BaseGuard {
  constructor(
    private readonly authError: AuthError,
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handleRequest(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      let data: SignupInputDto;

      const { kakaoAccessToken, appleIdentityToken } = request.body;
      const param = request.params.provider;

      switch (param) {
        case Provider.KAKAO:
          const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);

          if (!kakaoUserInfo) {
            throw new BadRequestException(AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR);
          }

          data.email = kakaoUserInfo.kakao_account.email;
          data.nickname = kakaoUserInfo.properties.nickname;
          data.gender = kakaoUserInfo.kakao_account.gender;
          break;

        case Provider.APPLE:
          const decodedToken = await this.authService.verifyAppleToken(
            appleIdentityToken,
          );

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
      const kakaoUserInfo = await axios
        .get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${kakaoAccessToken}`,
          },
        })
        .then((res) => res.data)
        .catch((e) => console.log(e.response.data));

      return kakaoUserInfo;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
