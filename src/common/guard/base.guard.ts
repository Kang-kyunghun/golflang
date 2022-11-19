import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const data = await this.handleRequest(context);

    const request = context.switchToHttp().getRequest();
    request['guard'] = data;

    return !!data;
  }

  abstract handleRequest(contenxt: ExecutionContext): any;
}
