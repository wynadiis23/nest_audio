import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tracks } from './entity/tracks.entity';
import { TracksMetadataModule } from '../tracks-metadata/tracks-metadata.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tracks]), TracksMetadataModule],
  providers: [TracksService],
  controllers: [TracksController],
  exports: [TracksService],
})
export class TracksModule {}
