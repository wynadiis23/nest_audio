import { Module } from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentController } from './playlist-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistContent } from './entity/playlist-content.entity';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlaylistContent]), TracksModule],
  providers: [PlaylistContentService],
  controllers: [PlaylistContentController],
})
export class PlaylistContentModule {}
