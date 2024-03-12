import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
} from '@nestjs/bull';
import { REGISTERED_QUEUE } from '../common/const';
import { Job } from 'bull';
import { convertMp3WebMFFmpeg } from '../utils/convert-mp3-to-webm';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { TracksMetadataService } from '../tracks-metadata/tracks-metadata.service';
import { CreateMetadataDto } from '../tracks-metadata/dto';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUDIO_TRANSCODING_EVENT } from './const';
import { AudioTranscodingDataType } from './type';

@Processor(REGISTERED_QUEUE)
export class AudioTranscodingConsumer {
  constructor(
    private readonly tracksMetadataService: TracksMetadataService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process()
  async transcode(job: Job<unknown>) {
    const jobData = job.data as AudioTranscodingDataType;
    const webmExt = 'webm';

    try {
      const ext = this.getExtFromFilePath(jobData.trackPath);

      if (ext === webmExt) {
        return;
      }

      const fullPathTrack = join(__dirname, '../..', jobData.trackPath);
      const fullPathOutputDir = this.createDirWebMTrack();

      const name = jobData.trackName.split(' ').join('-');

      const filename = name + '-' + Date.now() + webmExt;

      await convertMp3WebMFFmpeg(fullPathTrack, filename, fullPathOutputDir[0]);

      const metadataDto = new CreateMetadataDto();
      metadataDto.id = jobData.metadataId;
      metadataDto.trackId = jobData.trackId;
      metadataDto.trackPathWebM = `${fullPathOutputDir[1]}/${filename}.${webmExt}`;

      await this.tracksMetadataService.create(metadataDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  createDirWebMTrack() {
    const path = this.configService.get<string>('APP_TRACK_FOLDER');
    const extra = `/webm`;
    const destination = `${path}${extra}`;

    const fullPath = join(__dirname, '../..', destination);

    fs.mkdirSync(fullPath, { recursive: true });

    return [fullPath, destination];
  }

  getExtFromFilePath(trackPath: string) {
    const ext = trackPath.split('.').pop();

    return ext;
  }

  @OnQueueActive()
  onActive(job: Job) {
    Logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );

    const jobData = job.data as AudioTranscodingDataType;
    jobData.message = 'processing';

    this.eventEmitter.emit(AUDIO_TRANSCODING_EVENT, jobData);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    Logger.log(
      `Completed job ${job.id} of type ${job.name} with data ${job.data}...`,
    );

    const jobData = job.data as AudioTranscodingDataType;
    jobData.message = 'completed';

    this.eventEmitter.emit(AUDIO_TRANSCODING_EVENT, jobData);
  }
}
