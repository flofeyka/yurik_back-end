import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/chat.message.entity';
import { Chat } from './entities/chat.entity';
import { Agreement } from 'src/agreement/entities/agreement.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
  ) {}

  async getChat(chatId: number) {
    return await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        agreement: true,
      },
    });
  }

  public async createChat(agreement: Agreement) {
    const newChat = this.chatRepository.create({
      agreement,
    });
    await this.chatRepository.save(newChat);
    return newChat;
  }

  async createMessage(chatId: number, message: string) {
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
