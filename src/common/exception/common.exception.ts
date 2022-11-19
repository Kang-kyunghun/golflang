import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = exception?.getStatus();

    if (status === null) {
      status === 500;
    }

    response.status(status).json({
      ...(exception.getResponse() as Object),
      status,
    });
  }
}
