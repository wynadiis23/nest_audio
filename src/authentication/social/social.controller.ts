import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../decorator';
import { GoogleOAuthGuard } from './__test__/guard';
import { Response } from 'express';

@ApiTags('Authentication')
@Public()
@UseGuards(GoogleOAuthGuard)
@Controller('social')
export class SocialController {
  @Get('google')
  //   @UseGuards()
  async googleAuth(@Req() req) {
    console.log(req);
  }

  @Get('google-redirect')
  async googleRedirect(@Req() req, @Res() res: Response) {
    console.log(req.user);

    return {
      message: 'success',
    };
  }
}
