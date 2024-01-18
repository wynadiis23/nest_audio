import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class PlaylistContentDto {
  @IsArray()
  @IsNotEmpty()
  trackIds: string[];

  @IsString()
  @IsNotEmpty()
  playlistId: string;
}
