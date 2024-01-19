import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PlaylistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'name',
    type: 'string',
    required: true,
    description: 'Playlist name',
    example: 'playlist 17 august',
  })
  name: string;
}
