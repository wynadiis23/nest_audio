import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistContent } from './entity/playlist-content.entity';
import { DeepPartial, Repository } from 'typeorm';
import { PlaylistContentDto } from './dto/playlist-content.dto';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdatePlaylistEvent } from '../playlist/events';

@Injectable()
export class PlaylistContentService {
  constructor(
    @InjectRepository(PlaylistContent)
    private readonly playlistContentRepository: Repository<PlaylistContent>,
    private readonly tracksMetadataService: TracksMetadataService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(payload: PlaylistContentDto) {
    try {
      payload.trackIds = await this.validateTrackExistInPlaylist(
        payload.trackIds,
        payload.playlistId,
      );
      console.log(payload.trackIds);

      if (!payload.trackIds.length) {
        return;
      }

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

      await this.playlistContentRepository.save(datas);

      const playlistEventAction = 'add or remove';
      const updatePlaylistEvent = new UpdatePlaylistEvent();
      updatePlaylistEvent.id = payload.playlistId;
      updatePlaylistEvent.action = playlistEventAction;

      this.eventEmitter.emit('scaffold-updated-playlist', updatePlaylistEvent);
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

      const playlistEventAction = 'add or remove';
      const updatePlaylistEvent = new UpdatePlaylistEvent();
      updatePlaylistEvent.id = playlistId;
      updatePlaylistEvent.action = playlistEventAction;

      this.eventEmitter.emit('scaffold-updated-playlist', updatePlaylistEvent);

      return await deleteQuery.execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validateTrackExistInPlaylist(trackIds: string[], playlistId: string) {
    try {
      const trackIdsPlaylist = await this.playlistContentRepository.find({
        select: ['trackId'],
        where: {
          playlistId: playlistId,
        },
      });

      const validTrackIds = trackIds.filter(
        (id) =>
          !trackIdsPlaylist
            .map((playlistContent) => playlistContent.trackId)
            .includes(id),
      );

      return validTrackIds;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
