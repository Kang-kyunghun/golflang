import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization } = context.switchToHttp().getRequest().headers;

      if (authorization) {
        console.log('authorization :', authorization);

        const access_token = authorization?.split(' ');
        console.log('access_token :', access_token);

        const accountId = await this.validateToken(access_token[1]);
        console.log('accountId :', accountId);
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
