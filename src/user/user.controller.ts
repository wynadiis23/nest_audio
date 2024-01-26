import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../authentication/decorator';

@ApiTags('User')
@Public()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list all user',
  })
  async list() {
    return await this.userService.list();
  }
}
