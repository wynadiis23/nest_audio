import { Controller, DefaultValuePipe, Get, Query } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LogQueryInterface } from './interface';

@ApiTags('logger')
@ApiBearerAuth()
@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @ApiQuery({
    name: 'since',
    type: 'string',
    required: false,
    description: 'Since time',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'until',
    type: 'string',
    required: false,
    description: 'Until time',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'cursor',
    type: 'string',
    required: false,
    description: 'Cursor id',
    example: 'some-cursor-id',
  })
  @ApiQuery({
    name: 'users',
    isArray: true,
    type: 'string',
    required: false,
    description: 'Users',
    example: ['johndoe', 'some-user'],
  })
  async test(
    @Query('since') since: string,
    @Query('until') until: string,
    @Query('cursor') cursor: string,
    @Query('users', new DefaultValuePipe([])) users: string[],
  ) {
    if (!Array.isArray(users)) {
      users = [users];
    }

    const ILogQuery: LogQueryInterface = {
      since,
      until,
      cursor,
      users,
    };

    // TODO: refactor this
    if (users.includes('')) {
      users.push(null);
    }
    return await this.loggerService.getLog(ILogQuery);
  }

  @Get('users')
  async getUserInLog() {
    return await this.loggerService.getUserInLog();
  }
}
