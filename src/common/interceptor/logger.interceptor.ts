import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { RequestLoggerInterface } from '../interface';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context?.switchToHttp()?.getRequest<Request>();
    const { statusCode } = context?.switchToHttp()?.getResponse<Response>();
    const { originalUrl, method, params, query, body } = req;
    const requestTime = new Date();

    const user = req.body?.username || (req.user as any)?.username || ''; // (req.user as any)?.username user is from the logger.middleware

    const requestLogger: RequestLoggerInterface = {
      username: user,
      originalUrl,
      method,
      query,
      params,
      body,
    };

    return next.handle().pipe(
      tap((data) => {
        const response = { statusCode, data };
        console.log(response);
      }),
    );
  }
}
