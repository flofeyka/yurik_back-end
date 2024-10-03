import { Module } from '@nestjs/common';
import { GigachatController } from './gigachat.controller';
import { GigachatService } from './gigachat.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GigaChatMessage } from './entities/message.entity';
import { GigaChatDialog } from './entities/dialog.entity';
import { UserModule } from '../user/user.module';
import { ImagesModule } from '../images/images.module';

@Module({
  controllers: [GigachatController],
  providers: [GigachatService],
  imports: [
    HttpModule,
    UserModule,
    ImagesModule,
    TypeOrmModule.forFeature([GigaChatMessage, GigaChatDialog]),
  ],
  exports: [GigachatService]
})
export class GigachatModule {}
