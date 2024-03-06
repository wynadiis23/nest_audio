import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ClientKeyUserDto {
  @ApiProperty({
    name: 'clientKey',
    type: 'string',
    maxLength: 128,
    required: true,
    description: 'Client ke of user',
    example: 'some-client-key',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 128)
  clientKey: string;
}
