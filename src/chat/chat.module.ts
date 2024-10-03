import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/chat.message.entity';
import { Chat } from './entities/chat.entity';
import { AgreementModule } from 'src/agreement/agreement.module';
import { MemberService } from 'src/agreement/members/member.service';
import { ChatMember } from './entities/chat-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat, ChatMember]), forwardRef(() => AgreementModule)],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService]
})
export class ChatModule { };