import { ApiProperty, PartialType } from '@nestjs/swagger';
import { SignUpDto } from '../../authentication/dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { IsActiveEnum } from '../enum';
import { Transform } from 'class-transformer';

export class UpdateUserDto extends PartialType(SignUpDto) {
  @ApiProperty({
    name: 'isActive',
    enum: IsActiveEnum,
    required: false,
    description: 'Is auth active',
    example: IsActiveEnum.ACTIVE,
  })
  @IsEnum(IsActiveEnum, { each: true })
  @IsOptional()
  isActive?: number;

  @ApiProperty({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'User id',
    example: 'd315e163-d38e-4bfe-ac0d-2538788fb7b5',
  })
  @IsUUID(4)
  @IsNotEmpty()
  id: string;
}
