// uuid-array.pipe.ts
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'uuid';

@Injectable()
export class UUIDArrayPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!Array.isArray(value)) {
      value = [value];
    }

    for (const id of value) {
      console.log(id);
      if (!validate(id)) {
        throw new BadRequestException(`invalid UUID`);
      }
    }

    return value;
  }
}
