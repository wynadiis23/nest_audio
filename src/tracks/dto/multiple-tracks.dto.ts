import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { TracksDto } from './tracks.dto';
import { Type } from 'class-transformer';

export class MultipleTracksDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TracksDto)
  tracks: TracksDto[];
}
