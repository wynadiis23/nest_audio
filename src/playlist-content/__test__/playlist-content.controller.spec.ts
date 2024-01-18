import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistContentController } from '../playlist-content.controller';

describe('PlaylistContentController', () => {
  let controller: PlaylistContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistContentController],
    }).compile();

    controller = module.get<PlaylistContentController>(
      PlaylistContentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
