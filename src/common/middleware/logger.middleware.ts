import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TokenService } from '../../token/token.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  private readonly logger = new Logger('User Log');

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    let user = req.body?.username || '';

    if (accessToken) {
      const decodedRt = this.tokenService.decodeToken(accessToken);

      user = decodedRt?.username;
    }

    this.logger.log(`[${user}] accessing ${req.method} "${req.originalUrl}"`);

    if (next) {
      next();
    }
  }
}
