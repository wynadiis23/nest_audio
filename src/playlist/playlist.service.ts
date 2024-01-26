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

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly tracksMetadataService: TracksMetadataService,
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

  async list(publish: string) {
    const query = this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndMapMany(
        'playlist.playlistContents',
        PlaylistContent,
        'playlist_content',
        'playlist_content.playlistId = playlist.id',
      )
      .where('playlist.published = :publish', { publish });

    return await query.getMany();
  }

  async detail(id: string) {
    try {
      const query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoinAndMapMany(
          'playlist.playlistContents',
          PlaylistContent,
          'playlist_content',
          'playlist_content.playlistId = playlist.id',
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
            name: track.name,
            album: track.album,
            artist: track.artist,
            duration: track.duration,
            coverPath: track.coverPath,
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

      return await this.playlistRepository.save(data);
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
}
