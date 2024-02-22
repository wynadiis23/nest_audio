import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistImageService } from '../playlist-image.service';

describe('PlaylistImageService', () => {
  let service: PlaylistImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistImageService],
    }).compile();

    service = module.get<PlaylistImageService>(PlaylistImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
