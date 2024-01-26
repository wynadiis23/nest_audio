import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../user-role/entity/user-role.entity';
import { UserPlaylist } from '../user-playlist/entity/user-playlist.entity';
import { Playlist } from '../playlist/entity/playlist.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async list() {
    try {
      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.userId = user.id',
        )
        .leftJoinAndMapMany(
          'user.playlist',
          Playlist,
          'playlist',
          'user_playlist.playlistId = playlist.id',
        );

      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async create(username: string, password: string, roles: string[]) {
    try {
      const data = this.userRepository.create({ username, password });

      const userRole = roles.map((role) => ({
        userId: data.id,
        code: role,
      }));

      data.roles = userRole as unknown as UserRole[];
      return await this.userRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneByUsername(username: string) {
    try {
      return await this.userRepository.findOne({
        where: {
          username,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneById(id: string) {
    try {
      return await this.userRepository.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
