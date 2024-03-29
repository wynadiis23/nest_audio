import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { DeepPartial, Repository } from 'typeorm';
import { PlaylistDto } from './dto/playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistContent } from '../playlist-content/entity/playlist-content.entity';
import { PublishedStatusEnum } from './enum';
import { UserPlaylist } from '../user-playlist/entity/user-playlist.entity';
import { User } from '../user/entity/user.entity';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';
import { Tracks } from '../tracks/entity/tracks.entity';
import { TracksMetadata } from '../tracks-metadata/entity/tracks-metadata.entity';
import { IDataTable } from '../common/interface';
import { selectQuery } from '../common/query-builder';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SCAFFOLD_UPDATED_PLAYLIST, UpdatePlaylistEvent } from './events';
import { PlaylistImage } from '../playlist-image/entity/playlist-image.entity';
import { UPDATE_PLAYLIST_EVENT_CONST } from '../event-gateway/const';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly tracksMetadataService: TracksMetadataService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(payload: PlaylistDto) {
    try {
      const data = this.playlistRepository.create({
        name: payload.name,
      });

      return await this.playlistRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async list(dataTableOptions: IDataTable, publish: string) {
    const aliasEntity = 'playlist';
    let query = this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoin(
        PlaylistContent,
        'playlist_content',
        'playlist_content.playlistId = playlist.id',
      )
      .leftJoin(Tracks, 'tracks', 'playlist_content.trackId = tracks.id')
      .leftJoinAndMapOne(
        'playlist.image',
        PlaylistImage,
        'playlist_img',
        'playlist.id = playlist_img.playlistId',
      )
      .leftJoinAndMapMany(
        'playlist.contentMetadata',
        TracksMetadata,
        'tracks_metadata',
        'tracks_metadata.trackId = tracks.id',
      )
      .leftJoin(
        UserPlaylist,
        'user_playlist',
        'user_playlist.playlistId = playlist.id',
      )
      .leftJoinAndMapMany(
        'playlist.users',
        User,
        'user',
        'user_playlist.userId = user.id',
      )
      .where('playlist.published = :publish', { publish });

    if (dataTableOptions.filterBy) {
      query = selectQuery(
        query,
        aliasEntity,
        dataTableOptions.filterOperator,
        dataTableOptions.filterBy,
        dataTableOptions.filterValue,
      );
    }

    const skip = dataTableOptions.pageSize * dataTableOptions.pageIndex || 0;

    const result = await query
      .skip(skip)
      .take(dataTableOptions.pageSize)
      .orderBy(
        `${aliasEntity}.${dataTableOptions.sortBy}`,
        dataTableOptions.sortOrder,
      )
      .getManyAndCount();

    return result;
  }

  async detail(id: string, dataTableOptions?: IDataTable) {
    try {
      let query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoin(
          PlaylistContent,
          'playlist_content',
          'playlist_content.playlistId = playlist.id',
        )
        .leftJoin(Tracks, 'tracks', 'playlist_content.trackId = tracks.id')
        .leftJoinAndMapOne(
          'playlist.image',
          PlaylistImage,
          'playlist_img',
          'playlist.id = playlist_img.playlistId',
        )
        .leftJoinAndMapMany(
          'playlist.contentMetadata',
          TracksMetadata,
          'tracks_metadata',
          'tracks_metadata.trackId = tracks.id',
        )
        // will be checked by role. if role is admin. return all
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .leftJoinAndMapMany(
          'playlist.users',
          User,
          'user',
          'user_playlist.userId = user.id',
        )
        .where('playlist.id = :id', { id });

      if (dataTableOptions?.filterBy) {
        query = query
          .andWhere(
            `(CONCAT(LOWER(tracks_metadata.name), LOWER(tracks_metadata.artist)) LIKE '%' || :filterValue || '%' OR CONCAT(LOWER(tracks_metadata.artist), LOWER(tracks_metadata.name)) LIKE '%' || :filterValue || '%')`,
          )
          .setParameter(
            'filterValue',
            dataTableOptions.filterValue.toLocaleLowerCase(),
          );
      }

      return await query.getOne();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, payload: UpdatePlaylistDto) {
    try {
      if (id !== payload.id) {
        throw new BadRequestException('invalid playlist id');
      }
      let data: Playlist;

      if (payload.trackIds) {
        const trackMetadatas =
          await this.tracksMetadataService.getMultipleTrackMetadata(
            payload.trackIds,
          );

        const tracks = trackMetadatas.map(
          (track): DeepPartial<PlaylistContent> => ({
            trackId: track.trackId,
            playlistId: id,
            trackName: track.name,
          }),
        );

        if (tracks.length === 0) {
          payload.publish = PublishedStatusEnum.UNPUBLISHED;
        }

        data = this.playlistRepository.create({
          id: id,
          name: payload.name,
          published: parseInt(payload.publish),
          playlistContents: tracks,
        });
      } else {
        data = this.playlistRepository.create({
          id: id,
          name: payload.name,
          published: parseInt(payload.publish),
        });
      }

      const updateResult = await this.playlistRepository.save(data);

      const playlistEventAction =
        updateResult.published == 0
          ? 'playlist has been unpublished'
          : 'playlist has been updated';

      const updatePlaylistEvent = new UpdatePlaylistEvent();
      updatePlaylistEvent.id = id;
      updatePlaylistEvent.action = playlistEventAction;

      this.eventEmitter.emit(SCAFFOLD_UPDATED_PLAYLIST, updatePlaylistEvent);

      return updateResult;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string) {
    try {
      return await this.playlistRepository.delete(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @OnEvent(SCAFFOLD_UPDATED_PLAYLIST)
  async scaffoldingUpdatePlaylist(payload: UpdatePlaylistEvent) {
    try {
      const playlist = await this.detail(payload.id);
      if (!playlist) return;

      this.eventEmitter.emit(UPDATE_PLAYLIST_EVENT_CONST, {
        ...payload,
        users: playlist['users'].map((user: User) => user.username),
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
