import { Module } from '@nestjs/common';
import { PlaylistContentService } from './playlist-content.service';
import { PlaylistContentController } from './playlist-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistContent } from './entity/playlist-content.entity';
import { TracksMetadataModule } from '../tracks-metadata/tracks-metadata.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlaylistContent]), TracksMetadataModule],
  providers: [PlaylistContentService],
  controllers: [PlaylistContentController],
})
export class PlaylistContentModule {}
