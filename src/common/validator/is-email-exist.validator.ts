import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { UserService } from '../../user/user.service';

@ValidatorConstraint({ name: 'EmailExist', async: true })
@Injectable()
export class EmailExistsValidation implements ValidatorConstraintInterface {
  constructor(private userService: UserService) {}

  async validate(value: string): Promise<boolean> {
    return this.userService.findOneByEmail(value).then((data) => {
      if (data !== null) {
        return false;
      } else {
        return true;
      }
    });
  }

  defaultMessage() {
    return `User with this email already exist`;
  }
}

// Register The Decorator
export function IsEmailExist(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: EmailExistsValidation,
    });
  };
}
