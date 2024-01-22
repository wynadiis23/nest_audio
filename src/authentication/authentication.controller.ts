import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { SignInDto, SignUpDto } from './dto';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-in')
  @ApiBody({
    type: SignInDto,
    required: true,
  })
  async signIn(@Body() dto: SignInDto) {
    return await this.authenticationService.signIn(dto);
  }

  @Post('sign-up')
  @ApiBody({
    type: SignUpDto,
    required: true,
  })
  async signUp(@Body() dto: SignUpDto) {
    return await this.authenticationService.signUp(dto);
  }
}
