import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { DeepPartial, Not, Repository } from 'typeorm';
import { UserRole } from '../user-role/entity/user-role.entity';
import { UserPlaylist } from '../user-playlist/entity/user-playlist.entity';
import { Playlist } from '../playlist/entity/playlist.entity';
import { UpdateUserDto } from './dto';
import { IDataTable } from '../common/interface';
import * as dayjs from 'dayjs';
import { LastActivity } from '../last-activity/entity/last-activity.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LastActivity)
    private readonly lastActivityRepository: Repository<LastActivity>,
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
          query = query.andWhere(
            `LOWER(user.name) LIKE '%' || :filterValue || '%'`,
            {
              filterValue: dataTableOptions.filterValue.toLowerCase(),
            },
          );
        }
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
    oauthProvider?: string,
    oauthId?: string,
  ) {
    try {
      const data = this.userRepository.create({
        username,
        email,
        name,
        password,
        oauthProvider,
        oauthId,
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

  async detail(id: string) {
    try {
      const query = this.userRepository
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
        .where('user.id = :userId', { userId: id });

      return query.getOne();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findOneByUsername(username: string) {
    try {
      return await this.userRepository.findOne({
        relations: {
          lastActivity: true,
        },
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
        relations: {
          lastActivity: true,
        },
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
        relations: {
          lastActivity: true,
        },
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

      // validate name
      const isExist = await this.userRepository.findOne({
        where: {
          name: payload.name,
          id: Not(payload.id),
        },
      });

      if (isExist) {
        console.log(isExist);
        throw new BadRequestException('User with this name already exist.');
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

  async addOrUpdateClientKey(userId: string, clientKey: string) {
    const lastActivity = dayjs().format();
    const data = this.lastActivityRepository.create({
      userId: userId,
      lastActivityTime: new Date(lastActivity),
      clientKey: clientKey,
    });
    try {
      const user = await this.findOneById(userId);

      if (user.lastActivity) {
        user.lastActivity.lastActivityTime = new Date(lastActivity);
        user.lastActivity.clientKey = clientKey;
      } else {
        user.lastActivity = data;
      }

      user.save();

      return user;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
