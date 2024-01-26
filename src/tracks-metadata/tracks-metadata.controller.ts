import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TracksMetadataService } from './tracks-metadata.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateMetadataDto, UploadMetadataImgDto } from './dto';
import { Public } from '../authentication/decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';

const paths = ['/public/images/track-metadata'];

const fullPaths = [join(__dirname, '../../', paths[0])];
const storage = diskStorage({
  destination: (req, file, cb) => {
    // Create folder if not exists
    fullPaths.forEach((fullPath) => {
      fs.mkdirSync(fullPath, { recursive: true });
    });

    cb(null, fullPaths[0]);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('-');
    const ext = extname(file.originalname);
    cb(null, name + '-' + Date.now() + ext);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new BadRequestException('Provide a valid audio'), false);
  }
  cb(null, true);
};

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

  @Post('image/upload')
  @ApiOperation({ summary: 'Upload track metadata image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Track metadata id',
          example: 'd315e163-d38e-4bfe-ac0d-2538788fb7b5',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to be upload',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 1 * 10 * 10 * 10 * 10 * 10 * 10, // 1 mb in bytes
      },
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadMetadataImg(
    @UploadedFile() file: Express.Multer.File,
    @Body('id') id: string,
  ) {
    if (!file) throw new UnprocessableEntityException('Image file not found');

    const imageName = file.filename;

    const imagePaths = new UploadMetadataImgDto();
    imagePaths.path = paths[0] + '/' + imageName;
    console.log(imageName);
    console.log(imagePaths.path);

    await this.tracksMetadataService.uploadCoverImg(id, imagePaths.path);

    return {
      message: 'successfully saved track metadata image',
    };
  }
}
