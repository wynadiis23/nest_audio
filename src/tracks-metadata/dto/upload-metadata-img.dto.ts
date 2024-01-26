import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UploadMetadataImgDto {
  @ApiProperty({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Track metadata id',
    example: 'd315e163-d38e-4bfe-ac0d-2538788fb7b5',
  })
  @IsUUID(4)
  @IsOptional()
  id?: string;

  @ApiProperty({
    name: 'path',
    type: 'string',
    maxLength: 255,
    required: true,
    description: 'Track metadata image path',
    example: '/home/path/',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  path: string;
}
