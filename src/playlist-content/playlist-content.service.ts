import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistContent } from './entity/playlist-content.entity';
import { DeepPartial, Repository } from 'typeorm';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';

@Injectable()
export class PlaylistContentService {
  constructor(
    @InjectRepository(PlaylistContent)
    private readonly playlistContentRepository: Repository<PlaylistContent>,
    private readonly tracksMetadataService: TracksMetadataService,
  ) {}

  async create(payload: PlaylistContentDto) {
    try {
      const trackMetadatas =
        await this.tracksMetadataService.getMultipleTrackMetadata(
          payload.trackIds,
        );

      const tracks = trackMetadatas.map(
        (track): DeepPartial<PlaylistContent> => ({
          trackId: track.trackId,
          playlistId: payload.playlistId,
          trackName: track.name,
        }),
      );

      const datas = this.playlistContentRepository.create(tracks);
      console.log(datas);

      await this.playlistContentRepository.save(datas);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(ids: string[]) {
    try {
      await this.playlistContentRepository.delete(ids);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove2(trackIds: string[], playlistId: string) {
    try {
      const deleteQuery = this.playlistContentRepository
        .createQueryBuilder('playlist_content')
        .delete()
        .where('playlist_content.playlist_id = :playlistId', { playlistId })
        .andWhere('playlist_content.track_id IN (:...trackIds)', { trackIds });

      return await deleteQuery.execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
