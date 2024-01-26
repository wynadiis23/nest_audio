import { PartialType } from '@nestjs/swagger';
import { PublishedStatusEnum } from '../../playlist/enum';
import { SignUpDto } from '../../authentication/dto';

export class UpdateUserDto extends PartialType(SignUpDto) {
  publish: PublishedStatusEnum;
}
