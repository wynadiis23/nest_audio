import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IsPlaylistExist, IsUserExist } from '../../common/validator';

export class AddUserPlaylistDto {
  @ApiProperty({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'User id',
    example: '8b3919a2-d03e-466b-ad9f-58da71f2c045',
  })
  @IsUUID(4)
  @IsNotEmpty()
  @IsUserExist('id', {
    message: 'invalid user id',
  })
  userId: string;

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
