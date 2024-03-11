import { Module } from '@nestjs/common';
import { AudioTranscodingConsumer } from './audio-transcoding.consumer';
import { TracksMetadataModule } from '../tracks-metadata/tracks-metadata.module';

@Module({
  imports: [TracksMetadataModule],
  providers: [AudioTranscodingConsumer],
})
export class QueueModule {}
