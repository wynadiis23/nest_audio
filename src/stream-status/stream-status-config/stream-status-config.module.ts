import { Module } from '@nestjs/common';
import { StreamStatusConfigService } from './stream-status-config.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  providers: [StreamStatusConfigService],
  exports: [StreamStatusConfigService],
})
export class StreamStatusConfigModule {}
