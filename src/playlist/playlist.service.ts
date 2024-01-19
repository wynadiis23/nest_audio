import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { DeepPartial, Repository } from 'typeorm';
import { PlaylistDto } from './dto/playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { TracksService } from '../tracks/tracks.service';
import { PlaylistContent } from '../playlist-content/entity/playlist-content.entity';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly tracksService: TracksService,
  ) {}

  async create(payload: PlaylistDto) {
    try {
      const data = this.playlistRepository.create({
        name: payload.name,
      });

      await this.playlistRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async list() {
    return await this.playlistRepository.find();
  }

  async detail(id: string) {
    try {
      return await this.playlistRepository.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, payload: UpdatePlaylistDto) {
    try {
      const trackMetadatas = await this.tracksService.getMultipleTrackMetadata(
        payload.trackIds,
      );

      const tracks = trackMetadatas.map(
        (track): DeepPartial<PlaylistContent> => ({
          trackId: track.id,
          playlistId: id,
          trackName: track.name,
        }),
      );

      const data = this.playlistRepository.create({
        id: id,
        name: payload.name,
        playlistContents: tracks,
      });

      await this.playlistRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
