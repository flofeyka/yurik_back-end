import { Module } from '@nestjs/common';
import { GigachatController } from './gigachat.controller';
import { GigachatService } from './gigachat.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [GigachatController],
  providers: [GigachatService],
  imports: [HttpModule]
})
export class GigachatModule {}
