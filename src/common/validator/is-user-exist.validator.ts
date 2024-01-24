import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { UserService } from '../../user/user.service';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsValidation implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(value: string): Promise<boolean> {
    return this.userService.findOneById(value).then((data) => {
      if (data !== null) {
        return true;
      } else {
        return false;
      }
    });
  }

  defaultMessage() {
    return `users doesn't exists in table users`;
  }
}

// Register The Decorator
export function IsUserExist(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: UserExistsValidation,
    });
  };
}
