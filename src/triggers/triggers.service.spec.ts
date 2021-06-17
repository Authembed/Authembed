import { Test, TestingModule } from '@nestjs/testing';
import { TriggersService } from './triggers.service';

describe('TriggersService', () => {
  let service: TriggersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriggersService],
    }).compile();

    service = module.get<TriggersService>(TriggersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
