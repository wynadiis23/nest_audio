import * as ffmpeg from 'fluent-ffmpeg';
import { FfmpegCommand } from 'fluent-ffmpeg';

export function convertMp3WebMFFmpeg(
  inputPath: string,
  trackName: string,
  outputDir: string,
) {
  return new Promise((resolve, reject) => {
    const command: FfmpegCommand = ffmpeg(inputPath);

    command
      .output(`${outputDir}/${trackName}.webm`)
      .toFormat('webm')
      //   .videoCodec('none') // -vn equivalent
      //   .map(0, 0) // Copy audio stream only (0:a)
      .outputOptions('-vn')
      .outputOptions('-c:a libopus')
      .run();

    command
      .on('end', () => resolve(`${outputDir}/${trackName}.webm`))
      .on('error', (err) => reject(err));

    // command.save(`${outputDir}/output-%03d.webm`);
  });
}
