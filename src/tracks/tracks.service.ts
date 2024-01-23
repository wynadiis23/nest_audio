import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { TracksDto } from './dto';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import * as rangeParser from 'range-parser';
import { Tracks } from './entity/tracks.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { MultipleTracksDto } from './dto/multiple-tracks.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';
import { GetMetadataDto } from '../tracks-metadata/dto/get-metadata.dto';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Tracks)
    private readonly tracksRepository: Repository<Tracks>,
    private eventEmitter: EventEmitter2,
    private readonly tracksMetadataService: TracksMetadataService,
  ) {}

  async list() {
    return await this.tracksRepository.find();
  }

  async create(payload: TracksDto) {
    const data = this.tracksRepository.create({
      name: payload.name,
      path: payload.path,
      mimetype: payload.mimetype,
    });

    await this.tracksRepository.save(data);
  }

  async createMultiple(payload: MultipleTracksDto) {
    try {
      for (const track of payload.tracks) {
        this.eventEmitter.emit('add-tracks', { track: track.name });
      }
      // fix later
      this.eventEmitter.emit('add-tracks', { track: null });
      const tracks = this.tracksRepository.create(payload.tracks);

      const savedTracks = await this.tracksRepository.save(tracks);

      // find metadata
      const metadataToBeFound = savedTracks.map(
        (track): GetMetadataDto => ({
          id: track.id,
          path: track.path,
        }),
      );

      await this.tracksMetadataService.getMetadata({
        trackData: metadataToBeFound,
      });

      return savedTracks;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string) {
    try {
      return await this.tracksRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getTrackMetadata(id: string) {
    const trackMetadata = await this.tracksRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!trackMetadata) {
      throw new NotFoundException();
    }

    return trackMetadata;
  }

  async getMultipleTrackMetadata(ids: string[]) {
    try {
      const trackMetadatas = await this.tracksRepository.find({
        where: {
          id: In(ids),
        },
      });

      return trackMetadatas;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  parseRange(range: string, fileSize: number) {
    console.log(range, fileSize);
    const parseResult = rangeParser(fileSize, range);
    console.log(parseResult);
    if (parseResult === -1 || parseResult === -2 || parseResult.length !== 1) {
      throw new BadRequestException();
    }
    return parseResult[0];
  }

  getFileSize(path: string) {
    const stat = fs.statSync(join(__dirname, '../..', path));
    return stat.size;
  }

  getContentRange(rangeStart: number, rangeEnd: number, fileSize: number) {
    return `bytes ${rangeStart}-${rangeEnd}/${fileSize}`;
  }

  async getPartialTrackStream(id: string, range: string) {
    const trackMetadata = await this.getTrackMetadata(id);
    const trackPath = trackMetadata.path;
    const fileSize = this.getFileSize(trackPath);

    const { start, end } = this.parseRange(range, fileSize);

    const stream = createReadStream(join(__dirname, '../..', trackPath), {
      start,
      end,
    });

    const streamableFile = new StreamableFile(stream, {
      disposition: `inline; filename="${trackMetadata.name}"`,
      type: trackMetadata.mimetype,
    });

    const contentRange = this.getContentRange(start, end, fileSize);

    return {
      streamableFile,
      contentRange,
    };
  }

  async getTrackStreamById(id: string) {
    const trackMetadata = await this.getTrackMetadata(id);

    const stream = createReadStream(trackMetadata.path);

    return new StreamableFile(stream, {
      disposition: `inline; filename="${trackMetadata.name}"`,
      type: trackMetadata.mimetype,
    });
  }

  async deleteAllTrack() {
    try {
      return await this.tracksRepository.query(`DELETE FROM tracks`);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
