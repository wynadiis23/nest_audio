import { Module } from '@nestjs/common';
import { TracksMetadataService } from './tracks-metadata.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TracksMetadata } from './entity/tracks-metadata.entity';
import { TracksMetadataController } from './tracks-metadata.controller';
import { Tracks } from '../tracks/entity/tracks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TracksMetadata, Tracks])],
  providers: [TracksMetadataService],
  exports: [TracksMetadataService],
  controllers: [TracksMetadataController],
})
export class TracksMetadataModule {}
