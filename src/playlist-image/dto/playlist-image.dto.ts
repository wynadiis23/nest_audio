import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class PlaylistImageDto {
  @ApiProperty({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'playlist image id',
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
    description: 'Playlist image path',
    example: '/home/path/',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  path: string;

  @ApiProperty({
    name: 'thumbPath',
    type: 'string',
    maxLength: 255,
    required: true,
    description: 'Playlist image thumb path',
    example: '/home/thumb-path/',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  thumbPath: string;

  @ApiProperty({
    name: 'smallThumbPath',
    type: 'string',
    maxLength: 255,
    required: true,
    description: 'Playlist image small thumb path',
    example: '/home/small-thumb-path/',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  smallThumbPath: string;

  @ApiProperty({
    name: 'tinyThumbPath',
    type: 'string',
    maxLength: 255,
    required: true,
    description: 'Playlist image tiny thumb path',
    example: '/home/tiny-thumb-path/',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tinyThumbPath: string;

  @ApiProperty({
    name: 'playlistId',
    type: 'string',
    maxLength: 255,
    required: false,
    description: 'Playlist id',
    example: 'd315e163-d38e-4bfe-ac0d-2538788fb7b5',
  })
  @IsString()
  @IsOptional()
  playlistId?: string;
}
