import { Test, TestingModule } from '@nestjs/testing';
import { UserPlaylistService } from '../user-playlist.service';

describe('UserPlaylistService', () => {
  let service: UserPlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPlaylistService],
    }).compile();

    service = module.get<UserPlaylistService>(UserPlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
