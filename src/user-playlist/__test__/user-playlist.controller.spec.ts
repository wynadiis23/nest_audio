import { Test, TestingModule } from '@nestjs/testing';
import { UserPlaylistController } from '../user-playlist.controller';

describe('UserPlaylistController', () => {
  let controller: UserPlaylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPlaylistController],
    }).compile();

    controller = module.get<UserPlaylistController>(UserPlaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
