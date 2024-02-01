import { Test, TestingModule } from '@nestjs/testing';
import { EventGatewayConfigService } from '../event-gateway-config.service';

describe('EventGatewayConfigService', () => {
  let service: EventGatewayConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventGatewayConfigService],
    }).compile();

    service = module.get<EventGatewayConfigService>(EventGatewayConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
