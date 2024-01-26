import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { TracksMetadataModule } from '../tracks-metadata/tracks-metadata.module';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist]), TracksMetadataModule],
  providers: [PlaylistService],
  controllers: [PlaylistController],
  exports: [PlaylistService],
})
export class PlaylistModule {}
