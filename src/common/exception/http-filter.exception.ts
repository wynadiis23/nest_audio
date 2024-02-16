import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';

interface ErrorResponse {
  message: string[];
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    let responseBody: {
      messages: string[];
      statusCode: number;
      error?: string;
    };

    let httpStatus: number;
    const user = request.body?.username || request.user?.username || '';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const message = (exception.getResponse() as ErrorResponse).message;
      const errorName =
        (exception.getResponse() as ErrorResponse).error || exception.message;
      responseBody = {
        messages: typeof message === 'string' ? [message] : message,
        statusCode: httpStatus,
        error: errorName,
      };

      this.logger.log(`[${user}] ${errorName}`);
    } else {
      console.log(exception);
      const errorName = (exception as any).name;
      const message = (exception as any).message;
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody = {
        messages: ['internal server error'],
        statusCode: httpStatus,
        error: 'Internal Server Error',
      };

      this.logger.error(`[${user}] ${errorName} ${message}`);
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
