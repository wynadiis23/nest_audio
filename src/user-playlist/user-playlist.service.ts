import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPlaylist } from './entity/user-playlist.entity';
import { In, Not, Repository } from 'typeorm';
import { AddUserPlaylistDto } from './dto';
import * as crypto from 'crypto';
import { Playlist } from '../playlist/entity/playlist.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class UserPlaylistService {
  constructor(
    @InjectRepository(UserPlaylist)
    private readonly userPlaylistRepository: Repository<UserPlaylist>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async add(payload: AddUserPlaylistDto) {
    try {
      const userPlaylist = [];

      for (const id of payload.userId) {
        // validate duplicate hash
        const hash = this.createHash(id, payload.playlistId);
        const duplicate = await this.userPlaylistRepository.findOne({
          relations: {
            user: true,
          },
          where: {
            hash: hash,
          },
        });

        if (duplicate) {
          throw new BadRequestException(
            `user ${duplicate.user.username} has already added to this playlist`,
          );
        }

        userPlaylist.push({
          userId: id,
          playlistId: payload.playlistId,
          hash: hash,
        });
      }

      const data = this.userPlaylistRepository.create(userPlaylist);

      return await this.userPlaylistRepository.save(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async getPublishedUserPlaylist(userId: string) {
    try {
      const query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .where('playlist.publish = 1')
        .andWhere('user_playlist.userId = :userId', { userId });

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

  async getAvailableUser(playlistId: string) {
    try {
      // const queryBuilder = this.userRepository.createQueryBuilder('user');

      // queryBuilder.leftJoin(
      //   'user.userPlaylists',
      //   'userPlaylist',
      //   'userPlaylist.playlistId = :playlistId',
      //   { playlistId },
      // );

      // queryBuilder.where('userPlaylist.id IS NULL');

      // return await queryBuilder.getMany();

      const addedUserPlaylist = await this.userPlaylistRepository.find({
        select: ['userId'],
        where: {
          playlistId,
        },
      });

      const notYetAddedUsers = this.userRepository
        .createQueryBuilder('user')
        .select('user.id', 'id')
        .addSelect('user.username', 'username');

      if (!addedUserPlaylist.length) {
        return await notYetAddedUsers.getRawMany();
      }

      return await notYetAddedUsers
        .where('user.id NOT IN (:...userIds)', {
          userIds: addedUserPlaylist.map((userPlaylist) => userPlaylist.userId),
        })
        .getRawMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
