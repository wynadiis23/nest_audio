import { Test, TestingModule } from '@nestjs/testing';
import { TracksMetadataController } from '../tracks-metadata.controller';

describe('TracksMetadataController', () => {
  let controller: TracksMetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TracksMetadataController],
    }).compile();

    controller = module.get<TracksMetadataController>(TracksMetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
