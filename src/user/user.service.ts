import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { UserRole } from '../user-role/entity/user-role.entity';
import { UserPlaylist } from '../user-playlist/entity/user-playlist.entity';
import { Playlist } from '../playlist/entity/playlist.entity';
import { UpdateUserDto } from './dto';

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

  async create(
    username: string,
    name: string,
    password: string,
    roles: string[],
  ) {
    try {
      const data = this.userRepository.create({ username, name, password });

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

  async update(id: string, payload: UpdateUserDto) {
    try {
      if (id !== payload.id) {
        throw new BadRequestException('invalid user id');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { roles, ...rest } = payload;
      const updateUser: DeepPartial<User> = { ...rest };

      const userRoles: UserRole[] = [];
      if (payload?.roles?.length) {
        for (const role of payload.roles) {
          const userRole = new UserRole();
          userRole.code = role;
          userRole.userId = id;

          userRoles.push(userRole);
        }

        updateUser.roles = userRoles;
      }

      if (payload.isActive) {
        updateUser.isActive = payload.isActive;
      }

      const data = this.userRepository.create({
        id,
        ...updateUser,
      });

      await this.userRepository.save(data);
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
