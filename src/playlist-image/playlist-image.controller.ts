import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PlaylistImageService } from './playlist-image.service';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlaylistImageDto } from './dto';

const paths = [
  '/public/images/playlist/original/',
  '/public/images/playlist/main/',
  '/public/images/playlist/tiny/',
  '/public/images/playlist/small/',
  '/public/images/playlist/thumb/',
];

const fullPaths = [
  join(__dirname, '../../', paths[0]),
  join(__dirname, '../../', paths[1]),
  join(__dirname, '../../', paths[2]),
  join(__dirname, '../../', paths[3]),
  join(__dirname, '../../', paths[4]),
];

export const storage = diskStorage({
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

export const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    req.fileValidationError = 'Only image files are allowed';
  }
  cb(null, true);
};

@ApiTags('Playlist Image')
@ApiBearerAuth()
@Controller('playlist-image')
export class PlaylistImageController {
  constructor(private readonly playlistImageService: PlaylistImageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload playlist image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['playlistId', 'file'],
      properties: {
        playlistId: {
          type: 'string',
          format: 'uuid',
          description: 'Playlist id',
          example: 'd315e163-d38e-4bfe-ac0d-2538788fb7b5',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to be uploaded',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 1 * 10 * 10 * 10 * 10 * 10 * 10, // 1 mb in bytes,
      },
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async upload(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('playlistId') playlistId: string,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    if (!file) throw new UnprocessableEntityException('Image file not found');

    const mainImageName = 'main_' + file.filename;
    const tinyImageName = 'tiny_' + file.filename;
    const smallImageName = 'small_' + file.filename;
    const thumbImageName = 'thumb_' + file.filename;

    await sharp(file.path)
      .resize(680, 770)
      .toFile(fullPaths[1] + mainImageName);

    await sharp(file.path)
      .resize(100, 100)
      .toFile(fullPaths[2] + tinyImageName);

    await sharp(file.path)
      .resize(200, 200)
      .toFile(fullPaths[3] + smallImageName);

    await sharp(file.path)
      .resize(300, 300)
      .toFile(fullPaths[4] + thumbImageName);

    const imageDto = new PlaylistImageDto();

    imageDto.playlistId = playlistId;

    imageDto.path = paths[1] + mainImageName;
    imageDto.tinyThumbPath = paths[2] + tinyImageName;
    imageDto.smallThumbPath = paths[3] + smallImageName;
    imageDto.thumbPath = paths[4] + thumbImageName;

    await this.playlistImageService.upload(imageDto);

    return {
      message: 'successfully saved playlist image',
    };
  }
}
