import { ApiProperty } from '@nestjs/swagger';
import { PlaylistDto } from './playlist.dto';
import { ArrayNotEmpty, IsNotEmpty, IsUUID } from 'class-validator';
import { PublishedStatusEnum } from '../enum';

export class UpdatePlaylistDto extends PlaylistDto {
  @ApiProperty({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Playlist id',
    example: '06fe0ed6-005e-47c9-9714-47bbee9de94a',
  })
  @IsUUID(4)
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    name: 'trackIds',
    isArray: true,
    required: true,
    description: '81daa1e8-0eaf-4c11-907e-cb62f46b615f',
    example: ['81daa1e8-0eaf-4c11-907e-cb62f46b615f'],
  })
  @ArrayNotEmpty()
  @IsNotEmpty()
  trackIds?: string[];

  @ApiProperty({
    name: 'publish',
    type: 'string',
    enum: PublishedStatusEnum,
    required: false,
    description: 'Playlist published status',
    example: '1',
  })
  @IsUUID(4)
  @IsNotEmpty()
  publish?: PublishedStatusEnum;
}
