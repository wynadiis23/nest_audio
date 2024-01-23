import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class PlaylistContentDto {
  @ApiProperty({
    name: 'trackIds',
    isArray: true,
    required: true,
    description: '81daa1e8-0eaf-4c11-907e-cb62f46b615f',
    example: ['81daa1e8-0eaf-4c11-907e-cb62f46b615f'],
  })
  @ArrayNotEmpty()
  @IsNotEmpty()
  trackIds: string[];

  @ApiProperty({
    name: 'playlistId',
    type: 'string',
    required: true,
    description: 'Playlist ID',
    example: '2c808e31-0ada-4989-8baa-73613b7e725d',
  })
  @IsString()
  @IsNotEmpty()
  playlistId: string;
}
