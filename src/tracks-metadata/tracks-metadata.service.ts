import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TracksMetadata } from './entity/tracks-metadata.entity';
import { In, QueryRunner, Repository } from 'typeorm';
import { parseFile, selectCover } from 'music-metadata';
import { join } from 'path';
import { CreateMetadataDto, UpdateMetadataDto } from './dto';
import { tracksMetadata } from './type/tracks-metadata.type';
import { GetMetadataDto } from './dto/get-metadata.dto';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';

@Injectable()
export class TracksMetadataService {
  constructor(
    @InjectRepository(TracksMetadata)
    private readonly tracksMetadataRepository: Repository<TracksMetadata>,
    private readonly configService: ConfigService,
  ) {}

  async getMetadata(payload: GetMetadataDto) {
    try {
      const trackPath = join(__dirname, '../..', payload.path);

      const trackFFProbeMetadata = await this.getFFprobeMetadata(trackPath);
      const duration = trackFFProbeMetadata.format.duration.toString();

      const metadata = await parseFile(join(__dirname, '../..', payload.path), {
        duration: true,
      });

      const bitRate = metadata.format.bitrate;

      const minimumBitRate = this.configService.get<number>(
        'APP_TRACK_MINIMUM_BIT_RATE',
      );

      if (bitRate / 1000 < +minimumBitRate) {
        throw new BadRequestException(
          `${
            payload.name
          } does not meet the minimum bit rate ${+minimumBitRate} kbit/s`,
        );
      }

      const info: tracksMetadata = {
        trackId: payload.id,
        name: metadata.common.title ?? payload.name,
        album: metadata.common.album,
        artist: metadata.common.artist,
        coverPath: null,
        trackPath: payload.path,
        duration: duration,
      };

      const cover = selectCover(metadata.common.picture);

      if (cover) {
        const coverPath = await this.writeCoverToFile(payload.id, cover.data);
        info.coverPath = coverPath;
      }

      return info;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async getMultipleTrackMetadata(ids: string[]) {
    try {
      const trackMetadatas = await this.tracksMetadataRepository.find({
        where: {
          trackId: In(ids),
        },
      });

      return trackMetadatas;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // transaction from parent create multiple tracks in tracks service
  async create(payload: CreateMetadataDto, queryRunner?: QueryRunner) {
    try {
      if (queryRunner) {
        // continue transaction from tracks service
        const metadata = queryRunner.manager.create(
          TracksMetadata,
          payload as unknown as TracksMetadata[],
        );

        return await queryRunner.manager.save(metadata);
        // will be committed in tracks service
      }

      const data = this.tracksMetadataRepository.create(payload);

      return await this.tracksMetadataRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: string, payload: UpdateMetadataDto) {
    try {
      if (id !== payload.id) {
        throw new BadRequestException('invalid track metadata id');
      }

      // find tracks
      // const track = await this.tracksRepository.findOne({
      //   where: {
      //     id: payload.trackId
      //   }
      // })
      const data = this.tracksMetadataRepository.create({ id, ...payload });

      return await this.tracksMetadataRepository.save(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async uploadCoverImg(id: string, path: string) {
    try {
      // update
      const updated = await this.tracksMetadataRepository.update(
        { id: id },
        { coverPath: path },
      );

      return updated;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async writeCoverToFile(imgName: string, buffer: any) {
    try {
      const path = '/public';
      const extra = '/images/track-metadata';
      const destination = `${path}${extra}`;
      const fullPath = join(__dirname, '../..', destination);

      fs.mkdirSync(fullPath, { recursive: true });

      fs.writeFile(`${fullPath}/${imgName}.jpeg`, buffer, function (err) {
        if (err) throw err;
      });

      return destination + '/' + imgName + '.jpeg';
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getFFprobeMetadata(trackPath: string): Promise<ffmpeg.FfprobeData> {
    try {
      ffmpeg.setFfmpegPath(ffmpegPath.path);
      ffmpeg.setFfprobePath(ffmpegPath.path);

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(trackPath, (err, metadata) => {
          if (err) {
            reject(err);
          } else {
            resolve(metadata);
          }
        });
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
