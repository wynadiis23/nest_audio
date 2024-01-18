import { IsNotEmpty, IsString } from 'class-validator';

export class PlaylistDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
