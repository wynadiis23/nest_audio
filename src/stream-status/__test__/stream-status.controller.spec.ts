import { Test, TestingModule } from '@nestjs/testing';
import { StreamStatusController } from '../stream-status.controller';

describe('StreamStatusController', () => {
  let controller: StreamStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamStatusController],
    }).compile();

    controller = module.get<StreamStatusController>(StreamStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
