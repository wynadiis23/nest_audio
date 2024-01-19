import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LastActivity } from '../last-activity/entity/last-activity.entity';
import { Repository } from 'typeorm';
import { UpdateLastActivityDBDto } from './dto';

@Injectable()
export class StreamStatusService {
  constructor(
    @InjectRepository(LastActivity)
    private readonly lastActivityRepository: Repository<LastActivity>,
  ) {}

  async updateLastActivityDB(payload: UpdateLastActivityDBDto) {
    try {
      return await this.lastActivityRepository.upsert(
        { user: payload.user, lastActivityTime: payload.lastActivityTime },
        ['user'],
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getAllLastActivityFromDB() {
    try {
      return await this.lastActivityRepository.find();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
