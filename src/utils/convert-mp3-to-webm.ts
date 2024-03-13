import * as ffmpeg from 'fluent-ffmpeg';
import { FfmpegCommand } from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';

export function convertMp3WebMFFmpeg(
  inputPath: string,
  trackName: string,
  outputDir: string,
) {
  return new Promise((resolve, reject) => {
    ffmpeg.setFfmpegPath(ffmpegPath.path);
    const command: FfmpegCommand = ffmpeg(inputPath);

    command
      .output(`${outputDir}/${trackName}.webm`)
      .toFormat('webm')
      .outputOptions('-vn')
      .outputOptions('-c:a libopus')
      .run();

    command
      .on('end', () => resolve(`${outputDir}/${trackName}.webm`))
      .on('error', (err) => reject(err));
  });
}
