import { Test, TestingModule } from '@nestjs/testing';
import { EventGatewayGateway } from '../event-gateway.gateway';

describe('EventGatewayGateway', () => {
  let gateway: EventGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventGatewayGateway],
    }).compile();

    gateway = module.get<EventGatewayGateway>(EventGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
