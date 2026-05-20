import { Test, TestingModule } from '@nestjs/testing';
import { ControllerService } from './controller.service';

describe('ControllerService', () => {
  let service: ControllerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControllerService],
    }).compile();

    service = module.get<ControllerService>(ControllerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
