import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule implements ValidatorConstraintInterface {
  constructor(private userRepository: Repository<User>) {}

  async validate(username: string) {
    try {
      await this.userRepository.findOne({
        where: {
          username,
        },
      });
    } catch (e) {
      return false;
    }

    return true;
  }
}
