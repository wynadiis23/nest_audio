import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  async test() {
    return await this.loggerService.getLog();
  }
}
