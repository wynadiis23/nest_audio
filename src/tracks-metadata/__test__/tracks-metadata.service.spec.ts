import { Test, TestingModule } from '@nestjs/testing';
import { TracksMetadataService } from '../tracks-metadata.service';

describe('TracksMetadataService', () => {
  let service: TracksMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracksMetadataService],
    }).compile();

    service = module.get<TracksMetadataService>(TracksMetadataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
