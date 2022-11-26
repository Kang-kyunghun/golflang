import {
  BadRequestException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseGuard } from 'src/common/guard/base.guard';
import { Account } from 'src/modules/user/entity/account.entity';
import { Repository } from 'typeorm';
import { AuthError, AUTH_ERROR } from '../error/auth.error';
import axios from 'axios';
import { Provider } from '../enum/account.enum';

@Injectable()
export class LoginGuard extends BaseGuard {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    private readonly authError: AuthError,
    private readonly logger: Logger,
  ) {
    super();
  }

  async handleRequest(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const data = {
        email: null,
        provider: null,
        password: null,
        nickname: null,
        birthday: null,
        gender: null,
        address: null,
        addressDetail: null,
      };

      const { kakaoAccessToken, email, password } = request.body;
      const param = request.params.provider;

      switch (param) {
        case Provider.KAKAO:
          const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);

          if (!kakaoUserInfo) {
            throw new BadRequestException(AUTH_ERROR.ACCOUNT_SOCIAL_DATA_ERROR);
          }

          data.email = kakaoUserInfo.kakao_account.email;
          data.provider = param;
          data.nickname = kakaoUserInfo.properties.nickname;
          data.gender = kakaoUserInfo.kakao_account.gender;
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
