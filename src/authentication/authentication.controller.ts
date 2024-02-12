import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { SignInDto, SignUpDto } from './dto';
import { Response } from 'express';
import {
  GoogleOAuthGuard,
  LocalAuthGuard,
  RefreshTokenAuthGuard,
  RolesGuard,
} from './guard';
import { GetAuthorizedUser, Public, Roles } from './decorator';
import { AuthorizedUserType, googleOAuthType } from './types';
import { KEY_REFRESH_TOKEN_COOKIE } from './const';
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from '../user-role/enum';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-in')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: SignInDto,
    required: true,
  })
  @ApiOperation({
    summary: 'Sign in to application',
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

    return {
      message: 'sign in data authenticated',
      data: {
        username: signInResponse.username,
        roles: signInResponse.roles.map((role) => role.code),
        accessToken: signInResponse.accessToken,
      },
    };
  }

  @Post('sign-up')
  @Public()
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiBody({
    type: SignUpDto,
    required: true,
  })
  @ApiOperation({
    summary: 'Register new user',
  })
  async signUp(@Body() dto: SignUpDto) {
    const signUpResponse = await this.authenticationService.signUp(dto);

    return {
      message: 'Successfully register',
      username: signUpResponse.username,
    };
  }

  @Post('refresh-token')
  @Public()
  @UseGuards(RefreshTokenAuthGuard)
  @ApiOperation({
    summary: 'Get new access token based on refresh token',
  })
  async refreshToken(
    @GetAuthorizedUser() user: AuthorizedUserType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authenticationService.generateNewRefreshToken(
      user,
    );

    const generatedCookie =
      this.authenticationService.generateRefreshTokenCookie(
        tokens.refreshToken,
      );
    res.cookie(
      generatedCookie.key,
      generatedCookie.refreshToken,
      generatedCookie.options,
    );

    return {
      message: 'successfully renew token',
      data: {
        username: tokens.username,
        roles: tokens.roles.map((role) => role.code),
        accessToken: tokens.accessToken,
      },
    };
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign out user',
  })
  async signOut(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    console.log(req.user);
    await this.authenticationService.signOut(req.user);

    // clear cookie
    res.clearCookie(KEY_REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      domain: this.configService.get<string>('APP_COOKIE_DOMAIN'),
    });

    return {
      message: 'Sign out successfully',
    };
  }

  // OAuth
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('/oauth/google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Req() req) {}

  @Public()
  @UseGuards(GoogleOAuthGuard)
  @Get('/oauth/google-redirect')
  async googleRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as googleOAuthType;

    // google auth
    return await this.authenticationService.googleOAuth(user, res);
  }
}
