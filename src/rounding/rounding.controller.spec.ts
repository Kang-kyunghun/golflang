import { Test, TestingModule } from '@nestjs/testing';
import { RoundingController } from './rounding.controller';
import { RoundingService } from './rounding.service';

describe('RoundingController', () => {
  let controller: RoundingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoundingController],
      providers: [RoundingService],
    }).compile();

    controller = module.get<RoundingController>(RoundingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
