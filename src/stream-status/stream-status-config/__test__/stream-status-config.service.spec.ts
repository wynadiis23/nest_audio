import { Test, TestingModule } from '@nestjs/testing';
import { StreamStatusConfigService } from '../stream-status-config.service';

describe('StreamStatusConfigService', () => {
  let service: StreamStatusConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamStatusConfigService],
    }).compile();

    service = module.get<StreamStatusConfigService>(StreamStatusConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
