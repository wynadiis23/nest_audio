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
import { User } from '../user/entity/user.entity';
import { IDataTable } from '../common/interface';
import { selectQuery } from '../common/query-builder';

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

      for (const id of payload.userIds) {
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

  async getPublishedPlaylist(dataTableOptions: IDataTable) {
    try {
      const aliasEntity = 'playlist';
      let query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .where('playlist.published = 1')
        .andWhere('user_playlist.userId IS NULL');

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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getPublishedUserPlaylist(dataTableOptions: IDataTable, userId: string) {
    try {
      const aliasEntity = 'playlist';
      let query = this.playlistRepository
        .createQueryBuilder('playlist')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .where('playlist.published = 1')
        .andWhere('user_playlist.userId = :userId', { userId });

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
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(userIds: string[], playlistId: string) {
    try {
      const query = this.userPlaylistRepository
        .createQueryBuilder('up')
        .delete()
        .where('userId IN (:...userIds)', { userIds })
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
