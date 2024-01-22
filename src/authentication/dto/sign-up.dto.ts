import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { UserExistsRule } from '../../common/validator';

export class SignUpDto {
  @ApiProperty({
    name: 'username',
    type: 'string',
    maxLength: 15,
    required: true,
    description: 'Username to be used withing application',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 15)
  @Matches(/^[a-zA-Z0-9]/, {
    message: 'username must start with letter or number',
  })
  @Matches(/^(?!.*[_.]{2})/, {
    message: 'username must not contain __ or _. or ._ or .. inside',
  })
  @Matches(/^[A-Za-z0-9_.]*$/, {
    message:
      'username must not contain whitespace, only contain letters, numbers, underscore and period',
  })
  @Matches(/^.*[^_.]$/, {
    message: 'username most not end with underscore or period',
  })
  @Validate(UserExistsRule, {
    message: 'Username already exist.',
  })
  @Transform(({ value }) => value.toString().trim().toLowerCase())
  username: string;

  @ApiProperty({
    name: 'password',
    type: 'string',
    minLength: 6,
    maxLength: 15,
    required: true,
    description:
      'Combination of 1 lowercase, 1 uppercase, 1 symbol and 1 numeric value',
    example: 'P4ssword!',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  @Matches(/^(.*[a-z].*)$/, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches(/^(.*[A-Z].*)$/, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches(/^(.*\d.*)$/, {
    message: 'password must contain at least one digit',
  })
  @Matches(/^(.*\W.*)$/, {
    message: 'password must contain at least one non-word letter',
  })
  password: string;
}
