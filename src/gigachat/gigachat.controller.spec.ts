import { Test, TestingModule } from '@nestjs/testing';
import { GigachatController } from './gigachat.controller';

describe('GigachatController', () => {
  let controller: GigachatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GigachatController],
    }).compile();

    controller = module.get<GigachatController>(GigachatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
