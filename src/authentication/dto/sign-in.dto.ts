import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    name: 'username',
    type: 'string',
    required: true,
    description: 'Username to be used withing application',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    name: 'password',
    type: 'string',
    required: true,
    description: 'Password associate to the username',
    example: 'P4ssword!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
