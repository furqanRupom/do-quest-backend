import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
