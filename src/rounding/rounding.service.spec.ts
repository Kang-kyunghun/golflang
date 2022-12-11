import { Test, TestingModule } from '@nestjs/testing';
import { RoundingService } from './rounding.service';

describe('RoundingService', () => {
  let service: RoundingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundingService],
    }).compile();

    service = module.get<RoundingService>(RoundingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
