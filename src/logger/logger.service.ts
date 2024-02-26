import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { LogQueryInterface } from './interface';

@Injectable()
export class LoggerService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getLog(logQueryOptions: LogQueryInterface): Promise<any> {
    try {
      const x = this.connection.collection('log_collections');
      const query: any = {};

      if (logQueryOptions.since && logQueryOptions.until) {
        query['time'] = {
          $gte: new Date(logQueryOptions.since),
          $lt: new Date(logQueryOptions.until),
        };
      }

      if (logQueryOptions.users.length) {
        query['req._added.username'] = {
          $in: logQueryOptions.users,
        };
      }

      const response = await x.find(query).toArray();

      console.log(response.length);

      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getUserInLog() {
    try {
      const users = await this.connection
        .collection('log_collections')
        .distinct('req._added.username');

      // add empty username to list
      users.push('');

      return users;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
