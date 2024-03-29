import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../authentication/decorator';
import { UpdateUserDto } from './dto';
import { OperatorEnum, SortEnum } from '../common/enum';
import { IDataTable } from '../common/interface';
import { RoleEnum } from '../user-role/enum';
import { RolesGuard } from '../authentication/guard';
import { IsActiveEnum } from './enum';
import { ClientKeyUserDto } from './dto/client-key-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get list all user',
  })
  @ApiQuery({
    name: 'isActive',
    type: 'string',
    enum: IsActiveEnum,
    required: false,
    description: 'Active status',
    example: '1',
  })
  @ApiQuery({
    name: 'filterBy',
    type: 'string',
    required: false,
    description: 'Filter by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'filterOperator',
    type: 'string',
    enum: OperatorEnum,
    required: false,
    description: 'Filter operator',
    example: 'CONTAINS',
  })
  @ApiQuery({
    name: 'filterValue',
    type: 'string',
    required: false,
    description: 'Filter value',
    example: 'username',
  })
  @ApiQuery({
    name: 'sortBy',
    type: 'string',
    required: false,
    description: 'Sort by property',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    type: 'string',
    enum: SortEnum,
    required: false,
    description: 'Sort order',
    example: 'ASC',
  })
  @ApiQuery({
    name: 'pageIndex',
    type: 'number',
    required: false,
    description: 'Page index',
    example: 0,
  })
  @ApiQuery({
    name: 'pageSize',
    type: 'number',
    required: false,
    description: 'Page size',
    example: 20,
  })
  async list(
    @Query(
      'isActive',
      new DefaultValuePipe(IsActiveEnum.ACTIVE),
      new ParseEnumPipe(IsActiveEnum),
    )
    isActive: IsActiveEnum,
    @Query('filterBy', new DefaultValuePipe('name'))
    filterBy: string,
    @Query(
      'filterOperator',
      new DefaultValuePipe(OperatorEnum.CONTAINS),
      new ParseEnumPipe(OperatorEnum),
    )
    filterOperator: OperatorEnum,
    @Query('filterValue', new DefaultValuePipe('')) filterValue: string,
    @Query('sortBy', new DefaultValuePipe('name')) sortBy: string,
    @Query(
      'sortOrder',
      new DefaultValuePipe(SortEnum.ASC),
      new ParseEnumPipe(SortEnum),
    )
    sortOrder: SortEnum,
    @Query('pageIndex', new DefaultValuePipe(0), ParseIntPipe)
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(0), ParseIntPipe)
    pageSize: number,
  ) {
    const dataTableOptions: IDataTable = {
      filterBy,
      filterOperator,
      filterValue,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    };

    return await this.userService.list(parseInt(isActive), dataTableOptions);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail of user' })
  async detail(@Param('id') id: string) {
    return await this.userService.detail(id);
  }

  // update user
  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
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
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Remove user' })
  @ApiQuery({
    name: 'id',
    type: 'string',
    required: true,
    description: 'Id of user',
    example: '7babf166-1047-47f5-9e7d-a490b8df5a83',
  })
  async remove(@Query('id') id: string, @Req() req: any) {
    await this.userService.remove(req.user.sub, id);

    return {
      message: 'successfully remove user',
    };
  }

  @Get('get/user-roles')
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get user roles' })
  async userRoles() {
    const roles = Object.values(RoleEnum);
    return roles;
  }

  @Post('client-key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user client key' })
  @ApiBody({
    type: ClientKeyUserDto,
    required: true,
  })
  async userClientKey(@Body() dto: ClientKeyUserDto, @Req() req: any) {
    return await this.userService.addOrUpdateClientKey(
      req.user.sub,
      dto.clientKey,
    );
  }
}
