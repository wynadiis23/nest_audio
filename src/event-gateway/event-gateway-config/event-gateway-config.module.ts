import { Module } from '@nestjs/common';
import { EventGatewayConfigService } from './event-gateway-config.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [EventGatewayConfigService],
  exports: [EventGatewayConfigService],
})
export class EventGatewayConfigModule {}
