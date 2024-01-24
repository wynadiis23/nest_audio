import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPlaylist } from './entity/user-playlist.entity';
import { Repository } from 'typeorm';
import { AddUserPlaylistDto } from './dto';
import * as crypto from 'crypto';
import { Playlist } from '../playlist/entity/playlist.entity';

@Injectable()
export class UserPlaylistService {
  constructor(
    @InjectRepository(UserPlaylist)
    private readonly userPlaylistRepository: Repository<UserPlaylist>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
  ) {}

  async add(payload: AddUserPlaylistDto) {
    try {
      const hash = this.createHash(payload.userId, payload.playlistId);

      // validate duplicate hash
      const duplicate = await this.userPlaylistRepository.findOne({
        where: {
          hash: hash,
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'user has already added to this playlist',
        );
      }

      const data = this.userPlaylistRepository.create({
        userId: payload.userId,
        playlistId: payload.playlistId,
        hash: hash,
      });

      return await this.userPlaylistRepository.save(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async getUserPlaylist(userId: string) {
    try {
      const query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .where('user_playlist.userId = :userId', { userId });

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(userId: string, playlistId: string) {
    try {
      const query = this.userPlaylistRepository
        .createQueryBuilder('up')
        .delete()
        .where('userId = :userId', { userId })
        .andWhere('playlistId = :playlistId', { playlistId });

      return await query.execute();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  createHash(userId: string, playlistId: string) {
    return crypto
      .createHash('sha1')
      .update(`${userId}_${playlistId}`)
      .digest('hex');
  }
}
