import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateStreamStatusDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'status',
    type: 'string',
    required: true,
    description: 'Stream status',
    example: 'playing',
  })
  status: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'trackName',
    type: 'string',
    required: true,
    description: 'Stream track name',
    example: 'some track name',
  })
  trackName: string;
}
