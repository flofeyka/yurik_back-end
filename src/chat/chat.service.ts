import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { Message } from './entities/chat.message.entity';
import { Chat } from './entities/chat.entity';
import { Agreement } from 'src/agreement/entities/agreement.entity';
import { UUID } from 'crypto';
import { ChatDto } from './dtos/chat-dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
  ) { }

  async getChat(chatId: UUID): Promise<ChatDto> {
    const chatFound: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        agreement: {
          members: {
            user: true
          }
        }
      },
    });

    return new ChatDto(chatFound);
  }

  public async createChat(agreement: Agreement): Promise<Chat> {
    const newChatInsert: InsertResult = await this.chatRepository.createQueryBuilder().insert().into(Chat).values([{
      agreement
    }]).execute();

    const chatFound: Chat = await this.chatRepository.findOne({ where: { id: newChatInsert.identifiers[0].id } });
    // chatDto;
    return chatFound;
  }

  async createMessage(chatId: UUID, message: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        messages: true,
      },
    });
    const newMessage = this.messageRepository.create({
      message: message,
      chat: chat,
    });
    await this.messageRepository.save(newMessage);
  }

  async getChats(userId: number) {
    const chats = await this.chatRepository.find({
      where: {
        agreement: {
          members: {
            user: {
              id: userId,
            },
          },
        },
      },
      relations: {
        agreement: {
          members: {
            user: true,
          },
        },
      },
    });

    return chats;
  }
}
