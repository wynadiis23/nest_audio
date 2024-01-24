import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist]), TracksModule],
  providers: [PlaylistService],
  controllers: [PlaylistController],
  exports: [PlaylistService],
})
export class PlaylistModule {}
