import { Module } from '@nestjs/common';
import { StreamStatusService } from './stream-status.service';
import { StreamStatusController } from './stream-status.controller';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LastActivity } from '../last-activity/entity/last-activity.entity';
import { StreamStatusGateway } from './stream-status.gateway';
import { StreamStatusConfigModule } from './stream-status-config/stream-status-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LastActivity]),
    RedisCacheModule,
    StreamStatusConfigModule,
  ],
  providers: [StreamStatusService, StreamStatusGateway],
  controllers: [StreamStatusController],
})
export class StreamStatusModule {}
