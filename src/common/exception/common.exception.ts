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
    console.log('exception :', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = exception.getResponse() as
      | { message: any; statusCode: number }
      | { error: string; statusCode: 400; message: string[] };

    let status = exception?.getStatus();

    if (status === null) {
      status === 500;
    }

    // 예외처리 커스텀
    response.status(status).json({
      success: false,
      code: status,
      data: err.message,
    });
  }
}
