import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { PlaylistService } from '../../playlist/playlist.service';

@ValidatorConstraint({ name: 'PlaylistExists', async: true })
@Injectable()
export class PlaylistExistsValidation implements ValidatorConstraintInterface {
  constructor(private playlistService: PlaylistService) {}

  async validate(value: string): Promise<boolean> {
    return this.playlistService.detail(value).then((data) => {
      if (data !== null) {
        return true;
      } else {
        return false;
      }
    });
  }

  defaultMessage() {
    return `playlist doesn't exists in table users`;
  }
}

// Register The Decorator
export function IsPlaylistExist(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'PlaylistExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: PlaylistExistsValidation,
    });
  };
}
