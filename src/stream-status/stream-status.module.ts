import { Module } from '@nestjs/common';
import { StreamStatusService } from './stream-status.service';
import { StreamStatusController } from './stream-status.controller';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LastActivity } from '../last-activity/entity/last-activity.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LastActivity, User]),
    RedisCacheModule,
    UserModule,
  ],
  providers: [StreamStatusService],
  controllers: [StreamStatusController],
  exports: [StreamStatusService],
})
export class StreamStatusModule {}
