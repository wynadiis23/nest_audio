import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPlaylist } from './entity/user-playlist.entity';
import { Repository } from 'typeorm';
import { AddPlaylistUserDto, AddUserPlaylistDto } from './dto';
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

  async addPlaylistUser(payload: AddPlaylistUserDto) {
    try {
      const playlistUser = [];

      for (const id of payload.playlistIds) {
        const hash = this.createHash(id, payload.userId);
        const duplicate = await this.userPlaylistRepository.findOne({
          relations: {
            user: true,
            playlist: true,
          },
          where: {
            hash: hash,
          },
        });

        if (duplicate) {
          throw new BadRequestException(
            `user ${duplicate.user.username} has already added to this ${duplicate.playlist.name} playlist`,
          );
        }

        playlistUser.push({
          playlistId: id,
          userId: payload.userId,
          hash,
        });
      }

      const data = this.userPlaylistRepository.create(playlistUser);

      return await this.userPlaylistRepository.save(data);
    } catch (error) {
      console.log(error);
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
      // validate playlist id
      const validPlaylistId = await this.playlistRepository
        .createQueryBuilder('playlist')
        .select('id', 'id')
        .where('id = :playlistId', { playlistId: playlistId })
        .getRawOne();

      if (!validPlaylistId) {
        throw new BadRequestException('Invalid playlist id');
      }

      // validate user ids
      const validUserIds = await this.userRepository
        .createQueryBuilder('user')
        .select('id', 'id')
        .where('id IN (:...userIds)', { userIds: userIds })
        .getRawMany();

      if (userIds.length !== validUserIds.length) {
        throw new BadRequestException('One of user id was invalid');
      }

      // validate playlist belong to user
      await this.validatePlaylistBelongsToUsers(playlistId, userIds);

      // const query = this.userPlaylistRepository
      //   .createQueryBuilder('up')
      //   .delete()
      //   .where('userId IN (:...userIds)', { userIds })
      //   .andWhere('playlistId = :playlistId', { playlistId });

      // return await query.execute();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async validatePlaylistBelongsToUsers(playlistId: string, userIds: string[]) {
    try {
      const userOfPlaylist: { id: string }[] = await this.userPlaylistRepository
        .createQueryBuilder('user_playlist')
        .select('user_playlist.user_id', 'id')
        .where('user_playlist.playlist_id = :playlistId', { playlistId })
        .getRawMany();

      console.log(userOfPlaylist);

      const playlistUserIds = userOfPlaylist.map((user) => user.id);

      const validUserIds = userIds.filter((userId) =>
        playlistUserIds.includes(userId),
      );

      if (validUserIds.length !== userIds.length) {
        throw new BadRequestException(
          'One of user id does not belongs to this playlist',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
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

  async getAvailablePlaylist(userId: string, dataTableOptions?: IDataTable) {
    try {
      const addedPlaylistUser = await this.userPlaylistRepository.find({
        select: ['playlistId'],
        where: {
          userId,
        },
      });

      let notYetAddedPlaylist = this.playlistRepository
        .createQueryBuilder('playlist')
        .select('playlist.id', 'id')
        .addSelect('playlist.name', 'name');

      if (!addedPlaylistUser.length) {
        return await notYetAddedPlaylist.getRawMany();
      }

      notYetAddedPlaylist = notYetAddedPlaylist.where(
        'playlist.id NOT IN (:...playlistId)',
        {
          playlistId: addedPlaylistUser.map(
            (userPlaylist) => userPlaylist.playlistId,
          ),
        },
      );

      if (dataTableOptions.filterBy) {
        notYetAddedPlaylist = notYetAddedPlaylist
          .andWhere(`LOWER(playlist.name) LIKE '%' || :filterValue || '%'`)
          .setParameter(
            'filterValue',
            dataTableOptions.filterValue.toLocaleLowerCase(),
          );
      }

      return notYetAddedPlaylist.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
