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
import { IDataTable } from '../common/interface';
import { selectQuery } from '../common/query-builder';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async list(isActive: number, dataTableOptions: IDataTable) {
    try {
      const entity = 'user';
      let query = this.userRepository
        .createQueryBuilder('user')
        .leftJoin(
          UserPlaylist,
          'user_playlist',
          'user_playlist.userId = user.id',
        )
        .leftJoinAndMapMany(
          'user.roles',
          UserRole,
          'user_role',
          'user_role.userId = user.id',
        )
        .leftJoinAndMapMany(
          'user.playlist',
          Playlist,
          'playlist',
          'user_playlist.playlistId = playlist.id',
        )
        .where('user.isActive = :isActive', { isActive });

      if (dataTableOptions.filterBy) {
        if (dataTableOptions.filterBy == 'name') {
          dataTableOptions.filterValue =
            dataTableOptions.filterValue.toUpperCase();
        }
        query = selectQuery(
          query,
          entity,
          dataTableOptions.filterOperator,
          dataTableOptions.filterBy,
          dataTableOptions.filterValue,
        );
      }

      const skip = dataTableOptions.pageSize * dataTableOptions.pageIndex || 0;

      return await query
        .skip(skip)
        .take(dataTableOptions.pageSize)
        .orderBy(
          `${entity}.${dataTableOptions.sortBy}`,
          dataTableOptions.sortOrder,
        )
        .getManyAndCount();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async create(
    username: string,
    name: string,
    email: string,
    password: string,
    roles: string[],
  ) {
    try {
      const data = this.userRepository.create({
        username,
        email,
        name,
        password,
      });

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

  async findOneByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: {
          email,
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
        const isActivePossibleValues = [0, 1];

        if (!isActivePossibleValues.includes(+payload.isActive)) {
          throw new BadRequestException('invalid inactive value');
        }

        updateUser.isActive = payload.isActive;
      }

      const data = this.userRepository.create({
        id,
        ...updateUser,
      });

      await this.userRepository.save(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async remove(currentId: string, id: string) {
    try {
      if (currentId === id) {
        throw new BadRequestException('cannot delete this user');
      }
      await this.userRepository.delete(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
