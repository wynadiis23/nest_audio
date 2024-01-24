import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { TracksMetadataService } from './tracks-metadata.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateMetadataDto } from './dto';
import { Public } from '../authentication/decorator';

@ApiTags('Track Metadata')
@Public()
@Controller('tracks-metadata')
export class TracksMetadataController {
  constructor(private readonly tracksMetadataService: TracksMetadataService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update track metadata' })
  @ApiBody({ type: UpdateMetadataDto, required: true })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMetadataDto,
  ) {
    await this.tracksMetadataService.update(id, dto);

    return {
      message: 'successfully update track metadata',
    };
  }
}
