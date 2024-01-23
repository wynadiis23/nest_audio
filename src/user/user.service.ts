import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(username: string, password: string) {
    try {
      const data = this.userRepository.create({ username, password });

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
