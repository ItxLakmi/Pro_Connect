import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = jest.fn();
      $disconnect = jest.fn();
    },
  };
});

jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({})),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });
});
