import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistImageController } from '../playlist-image.controller';

describe('PlaylistImageController', () => {
  let controller: PlaylistImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistImageController],
    }).compile();

    controller = module.get<PlaylistImageController>(PlaylistImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
