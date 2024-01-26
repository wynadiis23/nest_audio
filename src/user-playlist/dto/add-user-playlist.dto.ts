import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsNotEmpty, IsUUID } from 'class-validator';
import { IsPlaylistExist, IsUserExist } from '../../common/validator';

export class AddUserPlaylistDto {
  @ApiProperty({
    name: 'userId',
    isArray: true,
    required: true,
    description: '81daa1e8-0eaf-4c11-907e-cb62f46b615f',
    example: ['81daa1e8-0eaf-4c11-907e-cb62f46b615f'],
  })
  @ArrayNotEmpty()
  @IsNotEmpty()
  @IsUserExist('id', {
    message: 'invalid user id',
    each: true,
  })
  userId: string[];

  @ApiProperty({
    name: 'playlistId',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Playlist id',
    example: '06fe0ed6-005e-47c9-9714-47bbee9de94a',
  })
  @IsUUID(4)
  @IsNotEmpty()
  @IsPlaylistExist('id', {
    message: 'invalid playlist id',
  })
  playlistId: string;
}
