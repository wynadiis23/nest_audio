import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Injectable()
export class LoggerService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getLog(): Promise<any> {
    try {
      const x = this.connection.collection('log_collections');
      const query: any = {
        'req._added.username': 'adisaputra.local',
      };
      return await x.find(query).limit(10).toArray();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
