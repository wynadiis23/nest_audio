import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../authentication/decorator';
import { UpdateUserDto } from './dto';

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

  // update user
  @Put(':id')
  @ApiBody({ type: UpdateUserDto, required: true })
  @ApiOperation({ summary: 'Update user detail' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    await this.userService.update(id, dto);
    return {
      message: 'successfully update user',
    };
  }

  // remove user
  @Delete()
  @ApiOperation({ summary: 'Remove user' })
  @ApiQuery({
    name: 'id',
    type: 'string',
    required: true,
    description: 'Id of track',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async remove(@Query('id') id: string) {
    await this.userService.remove(id);

    return {
      message: 'successfully remove user',
    };
  }
}
