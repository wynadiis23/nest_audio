import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { TracksDto } from './dto';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import * as rangeParser from 'range-parser';
import { Tracks } from './entity/tracks.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { MultipleTracksDto } from './dto/multiple-tracks.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';
import { Playlist } from '../playlist/entity/playlist.entity';
import { PlaylistContent } from '../playlist-content/entity/playlist-content.entity';
import { TracksMetadata } from '../tracks-metadata/entity/tracks-metadata.entity';
import { IDataTable } from '../common/interface';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Tracks)
    private readonly tracksRepository: Repository<Tracks>,
    private eventEmitter: EventEmitter2,
    private readonly tracksMetadataService: TracksMetadataService,
    private readonly dataSource: DataSource,
  ) {}

  async list(dataTableOptions: IDataTable) {
    let query = this.tracksRepository
      .createQueryBuilder('tracks')
      .leftJoinAndMapOne(
        'tracks.trackMetadata',
        TracksMetadata,
        'tracks_metadata',
        'tracks_metadata.trackId = tracks.id',
      )
      .leftJoin(
        PlaylistContent,
        'playlist_content',
        'playlist_content.trackId = tracks.id',
      )
      .leftJoinAndMapMany(
        'tracks.playlist',
        Playlist,
        'playlist',
        'playlist_content.playlistId = playlist.id',
      );

    if (dataTableOptions.filterBy) {
      dataTableOptions.filterValue = dataTableOptions.filterValue.replace(
        /\s/g,
        '',
      );

      query = query
        .where(
          `CONCAT(LOWER(tracks_metadata.name)) LIKE '%' || :filterValue || '%'`,
        )
        // .orWhere(
        //   `CONCAT(warehouse.code, brand.code) LIKE '%' || :filterValue || '%'`,
        // )
        .setParameter('filterValue', dataTableOptions.filterValue);
    }

    return await query.getMany();
  }

  async getAvailableTrackForPlaylist(playlistId: string) {
    try {
      // get list track of current playlist
      const query = this.tracksRepository
        .createQueryBuilder('tracks')
        .select('tracks.id')
        .leftJoin(
          PlaylistContent,
          'playlist_content',
          'playlist_content.trackId = tracks.id',
        )
        .leftJoin(
          Playlist,
          'playlist',
          'playlist_content.playlistId = playlist.id',
        )
        .where('playlist.id = :playlistId', { playlistId });

      const alreadyAddedTrack = await query.getMany();
      const ids = alreadyAddedTrack.map((track) => track.id);

      return await this.tracksRepository.find({
        where: {
          id: Not(In(ids)),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
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
      // find already uploaded track by it original file name
      const originalFileNames = payload.tracks.map((track) => track.name);
      const exclude = await this.findByTrackName(originalFileNames);

      if (Array.isArray(exclude)) {
        const excludeTracks = exclude.map((track) => track.name);
        payload.tracks = payload.tracks.filter(
          (track) => !excludeTracks.includes(track.name),
        );
      }

      for (const track of payload.tracks) {
        this.eventEmitter.emit('add-tracks', {
          track: track.name,
          status: 'adding tracks',
        });
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const tracks = queryRunner.manager.create(
          Tracks,
          payload.tracks as unknown as Tracks[],
        );

        const savedTracks = await queryRunner.manager.save(tracks);

        for (const track of savedTracks) {
          const metadata = await this.tracksMetadataService.getMetadata({
            id: track.id,
            path: track.path,
            name: track.name,
          });

          this.eventEmitter.emit('add-tracks', {
            track: track.name,
            status: 'getting metadata',
          });
          await this.tracksMetadataService.create(metadata, queryRunner);
        }

        // commit all transaction
        await queryRunner.commitTransaction();

        this.eventEmitter.emit('add-tracks', {
          track: null,
          status: null,
        });
        return savedTracks;
      } catch (error) {
        await queryRunner.rollbackTransaction();

        throw new InternalServerErrorException();
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findByTrackName(names: string[] | string): Promise<Tracks | Tracks[]> {
    try {
      if (Array.isArray(names)) {
        return await this.tracksRepository.find({
          where: {
            name: In(names),
          },
        });
      }

      return await this.tracksRepository.findOne({
        where: {
          name: names,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findByTrackId(id: string) {
    try {
      return await this.tracksRepository
        .createQueryBuilder('tracks')
        .leftJoinAndMapOne(
          'tracks.trackMetadata',
          TracksMetadata,
          'tracks_metadata',
          'tracks_metadata.trackId = tracks.id',
        )
        .where('tracks.id = :id', { id })
        .getOne();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async delete(id: string) {
    try {
      const track = await this.findByTrackId(id);

      if (!track) {
        throw new BadRequestException('invalid track id');
      }

      fs.unlink(join(__dirname, '../..', track.path), (error) => {
        if (error) {
          throw new BadRequestException(
            'error while delete file on disk',
            error.message,
          );
        } else {
          Logger.warn('Delete file on disk', 'TracksService');
        }
      });

      return await this.tracksRepository.delete(id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
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
    const stat = fs.statSync(path);
    return stat.size;
  }

  getContentRange(rangeStart: number, rangeEnd: number, fileSize: number) {
    return `bytes ${rangeStart}-${rangeEnd}/${fileSize}`;
  }

  async getPartialTrackStream(id: string, range: string) {
    try {
      const trackMetadata = await this.getTrackMetadata(id);
      const trackPath = join(__dirname, '../..', trackMetadata.path);

      const fileExist = await this.checkFileExist(trackPath);
      if (!fileExist) {
        throw new BadRequestException('File not found');
      }

      const fileSize = this.getFileSize(trackPath);

      const { start, end } = this.parseRange(range, fileSize);

      const stream = createReadStream(trackPath, {
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
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async getTrackStreamById(id: string) {
    try {
      const trackMetadata = await this.getTrackMetadata(id);
      const trackPath = join(__dirname, '../..', trackMetadata.path);

      const fileExist = await this.checkFileExist(trackPath);

      if (!fileExist) {
        throw new BadRequestException('File not found');
      }

      const stream = createReadStream(trackPath);

      return new StreamableFile(stream, {
        disposition: `inline; filename="${trackMetadata.name}"`,
        type: trackMetadata.mimetype,
      }).setErrorLogger((error) => {
        Logger.warn(error.message, 'Streamable');
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async deleteAllTrack() {
    try {
      // fix this magic string later
      const path = '/public/files/tracks';
      const directory = join(__dirname, '../..', path);

      fs.readdir(directory, (err, files) => {
        if (err) {
          throw new BadRequestException(
            `error while reading directory ${directory}`,
            err.message,
          );
        }
        for (const file of files) {
          fs.unlink(join(directory, file), (err) => {
            if (err) {
              throw new BadRequestException(
                `error while delete file on disk`,
                err.message,
              );
            } else {
              Logger.warn('Delete file on disk', 'TracksService');
            }
          });
        }
      });

      return await this.tracksRepository.query(`DELETE FROM tracks`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  async checkFileExist(path: string): Promise<boolean> {
    const file = fs.existsSync(path);

    return file;
  }
}
