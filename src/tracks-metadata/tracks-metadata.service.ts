import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TracksMetadata } from './entity/tracks-metadata.entity';
import { Repository } from 'typeorm';
import { parseFile } from 'music-metadata';
import { join } from 'path';
import { GetMultipleMetadataDto, UpdateMetadataDto } from './dto';
import { tracksMetadata } from './type/tracks-metadata.type';

@Injectable()
export class TracksMetadataService {
  constructor(
    @InjectRepository(TracksMetadata)
    private readonly tracksMetadataRepository: Repository<TracksMetadata>,
  ) {}

  async getMetadata(payload: GetMultipleMetadataDto) {
    try {
      const trackMetadata: {
        trackId: string;
        name: string;
        album: string;
        artist: string;
        duration: string;
      }[] = [];

      for (const track of payload.trackData) {
        const metadata = await parseFile(join(__dirname, '../..', track.path), {
          duration: true,
        });

        const info: tracksMetadata = {
          trackId: track.id,
          name: metadata.common.title,
          album: metadata.common.album,
          artist: metadata.common.artist,
          duration: metadata.format.duration.toString(),
        };

        trackMetadata.push(info);
      }

      const data = this.tracksMetadataRepository.create(trackMetadata);

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
      const data = this.tracksMetadataRepository.create({ id, ...payload });

      return await this.tracksMetadataRepository.save(data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }
}
