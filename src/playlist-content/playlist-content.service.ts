import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistContent } from './entity/playlist-content.entity';
import { Repository } from 'typeorm';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class PlaylistContentService {
  constructor(
    @InjectRepository(PlaylistContent)
    private readonly playlistContentRepository: Repository<PlaylistContent>,
    private readonly tracksService: TracksService,
  ) {}

  async create(payload: PlaylistContentDto) {
    try {
      const trackMetadatas = await this.tracksService.getMultipleTrackMetadata(
        payload.trackIds,
      );

      const tracks = trackMetadatas.map((track) => ({
        trackId: track.id,
        playlistId: payload.playlistId,
        trackName: track.name,
      }));

      const datas = this.playlistContentRepository.create(tracks);

      await this.playlistContentRepository.save(datas);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(payload: PlaylistContentDto) {
    try {
      return await this.playlistContentRepository
        .createQueryBuilder('playlist_content')
        .delete()
        .where('playlistId = :playlistId', { playlistId: payload.playlistId })
        .andWhere('trackId IN (:...trackIds)', { trackIds: payload.trackIds })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
