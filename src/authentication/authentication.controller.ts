import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { SignInDto, SignUpDto } from './dto';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-in')
  @ApiBody({
    type: SignInDto,
    required: true,
  })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const signInResponse = await this.authenticationService.signIn(dto);
    const generatedCookie =
      this.authenticationService.generateRefreshTokenCookie(
        signInResponse.refreshToken,
      );
    res.cookie(
      generatedCookie.key,
      generatedCookie.refreshToken,
      generatedCookie.options,
    );

    return signInResponse;
  }

  @Post('sign-up')
  @ApiBody({
    type: SignUpDto,
    required: true,
  })
  async signUp(@Body() dto: SignUpDto) {
    const signUpResponse = await this.authenticationService.signUp(dto);

    return {
      message: 'Successfully register',
      username: signUpResponse.username,
    };
  }
}
