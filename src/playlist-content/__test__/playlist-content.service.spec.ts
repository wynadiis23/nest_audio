import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistContentService } from '../playlist-content.service';

describe('PlaylistContentService', () => {
  let service: PlaylistContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistContentService],
    }).compile();

    service = module.get<PlaylistContentService>(PlaylistContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
