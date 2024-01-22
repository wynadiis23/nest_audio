import { Injectable, NestMiddleware } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class UploadProgressMiddleware implements NestMiddleware {
  constructor(private eventEmitter: EventEmitter2) {}

  use(req: Request, res: Response, next: NextFunction) {
    let progress = 0;
    const fileSize = parseInt(req.headers['content-length']);

    req.on('data', (chunk) => {
      progress += chunk.length;
      const percentage = (progress / fileSize) * 100;

      this.eventEmitter.emit('upload-progress', {
        uploadProgress: percentage,
        totalFileSize: fileSize,
      });
    });

    next();
  }
}
