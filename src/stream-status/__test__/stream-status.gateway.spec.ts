import { Test, TestingModule } from '@nestjs/testing';
import { StreamStatusGateway } from '../stream-status.gateway';

describe('StreamStatusGateway', () => {
  let gateway: StreamStatusGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamStatusGateway],
    }).compile();

    gateway = module.get<StreamStatusGateway>(StreamStatusGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
