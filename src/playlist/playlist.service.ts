import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { Repository } from 'typeorm';
import { PlaylistDto } from './dto/playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
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
}
