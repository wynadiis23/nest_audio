import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracks } from './entity/tracks.entity';
import { TracksMetadataModule } from '../tracks-metadata/tracks-metadata.module';
import { BullModule } from '@nestjs/bull';
import { REGISTERED_QUEUE } from '../common/const';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tracks]),
    TracksMetadataModule,
    BullModule.registerQueue({ name: REGISTERED_QUEUE }),
  ],
  providers: [TracksService],
  controllers: [TracksController],
  exports: [TracksService],
})
export class TracksModule {}
