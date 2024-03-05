import { Test, TestingModule } from '@nestjs/testing';
import { PromMetricsController } from '../prom-metrics.controller';

describe('PromMetricsController', () => {
  let controller: PromMetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromMetricsController],
    }).compile();

    controller = module.get<PromMetricsController>(PromMetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
