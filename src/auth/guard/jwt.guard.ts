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
import { Account } from 'src/user/entity/account.entity';
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

      if (authorization) {
        const access_token = authorization?.split(' ');
        const accountUid = await this.validateToken(access_token[1]);

        const account = await this.accountRepository.findOne({
          where: { uid: accountUid },
          relations: { user: true },
        });

        if (!account) {
          throw new UnauthorizedException('유저를 찾을 수 없음');
        }

        request['userId'] = account.user.id;
        request['accountId'] = account.id;
        request['role'] = account.user.role;
      } else {
        request['role'] = PermissionRole.PUBLIC;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error.message);
    }
  }

  async validateToken(token: string) {
    try {
      const verify = this.jwtService.verify(token).id;
      return verify;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(error.message);
    }
  }
}
