import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsNotExist } from '../../common/validator';

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
  @Validate(IsNotExist, ['Playlist'], {
    message: 'Playlist already exist.',
  })
  name: string;
}
