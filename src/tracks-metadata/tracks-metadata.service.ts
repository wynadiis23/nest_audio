import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TracksMetadata } from './entity/tracks-metadata.entity';
import { QueryRunner, Repository } from 'typeorm';
import { parseFile } from 'music-metadata';
import { join } from 'path';
import { CreateMetadataDto, UpdateMetadataDto } from './dto';
import { tracksMetadata } from './type/tracks-metadata.type';
import { Tracks } from '../tracks/entity/tracks.entity';
import { GetMetadataDto } from './dto/get-metadata.dto';

@Injectable()
export class TracksMetadataService {
  constructor(
    @InjectRepository(TracksMetadata)
    private readonly tracksMetadataRepository: Repository<TracksMetadata>,
    @InjectRepository(Tracks)
    private readonly tracksRepository: Repository<Tracks>,
  ) {}

  async getMetadata(payload: GetMetadataDto) {
    try {
      const metadata = await parseFile(join(__dirname, '../..', payload.path), {
        duration: true,
      });

      const info: tracksMetadata = {
        trackId: payload.id,
        name: metadata.common.title ?? payload.name,
        album: metadata.common.album,
        artist: metadata.common.artist,
        duration: metadata.format.duration.toString(),
      };

      return info;
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
}
