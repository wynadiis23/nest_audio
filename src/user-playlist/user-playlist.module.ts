import { Module } from '@nestjs/common';
import { UserPlaylistController } from './user-playlist.controller';
import { UserPlaylistService } from './user-playlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPlaylist } from './entity/user-playlist.entity';
import { Playlist } from '../playlist/entity/playlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPlaylist, Playlist])],
  controllers: [UserPlaylistController],
  providers: [UserPlaylistService],
})
export class UserPlaylistModule {}
