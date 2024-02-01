import { Module } from '@nestjs/common';
import { EventGatewayGateway } from './event-gateway.gateway';
import { EventGatewayConfigModule } from './event-gateway-config/event-gateway-config.module';
import { StreamStatusModule } from '../stream-status/stream-status.module';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';

@Module({
  imports: [EventGatewayConfigModule, StreamStatusModule, RedisCacheModule],
  providers: [EventGatewayGateway],
})
export class EventGatewayModule {}
