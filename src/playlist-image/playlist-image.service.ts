import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaylistImage } from './entity/playlist-image.entity';
import { Repository } from 'typeorm';
import { PlaylistImageDto } from './dto';

@Injectable()
export class PlaylistImageService {
  constructor(
    @InjectRepository(PlaylistImage)
    private readonly playlistImageRepository: Repository<PlaylistImage>,
  ) {}

  async upload(dto: PlaylistImageDto) {
    try {
      // remove previous image
      const previousImage: string = await this.playlistImageRepository
        .createQueryBuilder('playlistImg')
        .select('id', 'id')
        .where('playlistImg.playlistId = :playlistId', {
          playlistId: dto.playlistId,
        })
        .getRawOne();

      if (previousImage) {
        // remove
        await this.playlistImageRepository.delete(previousImage);
      }

      const data = this.playlistImageRepository.create(dto);

      await this.playlistImageRepository.save(data);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
