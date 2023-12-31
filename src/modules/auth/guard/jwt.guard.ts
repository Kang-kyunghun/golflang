import { AUTH_ERROR } from 'src/modules/auth/error/auth.error';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { PermissionRole } from 'src/common/enum/common.enum';
import { Account } from 'src/modules/user/entity/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization } = context.switchToHttp().getRequest().headers;

      console.log(1, authorization);

      if (authorization) {
        const access_token = authorization?.split(' ');
        const accountUid = await this.validateToken(access_token[1]);

        console.log(2, accountUid);

        const account = await this.accountRepository.findOne({
          where: { uid: accountUid },
          relations: { user: true },
        });

        if (!account) {
          throw new UnauthorizedException(AUTH_ERROR.ACCESS_TOKEN_ERROR);
        }

        request['userId'] = account.user.id;
        request['accountId'] = account.id;
        request['role'] = account.user.role;
      } else {
        throw new UnauthorizedException(AUTH_ERROR.ACCESS_TOKEN_ERROR);
      }

      return request;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(AUTH_ERROR.ACCESS_TOKEN_ERROR);
    }
  }

  async validateToken(token: string) {
    try {
      const verify = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
      });

      return verify.accountUid;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error.message);
    }
  }
}
