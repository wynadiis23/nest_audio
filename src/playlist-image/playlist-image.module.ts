import { Module } from '@nestjs/common';
import { PlaylistImageService } from './playlist-image.service';
import { PlaylistImageController } from './playlist-image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistImage } from './entity/playlist-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlaylistImage])],
  providers: [PlaylistImageService],
  controllers: [PlaylistImageController],
})
export class PlaylistImageModule {}
