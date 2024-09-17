import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/chat.message.entity';
import { Chat } from './entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat])],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService]
})
export class ChatModule {}
