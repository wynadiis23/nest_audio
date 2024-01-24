import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMetadataDto {
  @ApiProperty({
    name: 'id',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'Track metadata id',
    example: '06fe0ed6-005e-47c9-9714-47bbee9de94a',
  })
  @IsUUID(4)
  @IsNotEmpty()
  id: string;

  @IsString()
  @ApiProperty({
    name: 'name',
    type: 'string',
    description: 'track metadata name/title of track',
    example: 'some of track name',
  })
  @IsOptional()
  name?: string;

  @IsString()
  @ApiProperty({
    name: 'album',
    type: 'string',
    description: 'track metadata album',
    example: 'some of track album',
  })
  @IsOptional()
  album?: string;

  @IsString()
  @ApiProperty({
    name: 'artist',
    type: 'string',
    description: 'track metadata artist of track',
    example: 'some artist',
  })
  @IsOptional()
  artist?: string;
}
