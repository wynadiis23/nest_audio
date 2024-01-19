import { Test, TestingModule } from '@nestjs/testing';
import { StreamStatusService } from '../stream-status.service';

describe('StreamStatusService', () => {
  let service: StreamStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamStatusService],
    }).compile();

    service = module.get<StreamStatusService>(StreamStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
