import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Agreement } from 'src/agreement/entities/agreement.entity';
import { AgreementMember } from 'src/agreement/members/member.entity';
import { InsertResult, Repository } from 'typeorm';
import { ChatDto } from './dtos/chat-dto';
import { ChatMember } from './entities/chat-member.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/chat.message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMember) private readonly chatMemberRepository: Repository<ChatMember>,
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
    const agreementMembers: AgreementMember[] = agreement.members;
    const chatMembers: ChatMember[] = await Promise.all(agreementMembers.map(async (member: AgreementMember) => {
      const memberCreated: InsertResult = await this.chatMemberRepository.createQueryBuilder().insert().into(ChatMember).values([{
        member
      }]).execute();

      return await this.chatMemberRepository.findOne({ where: { id: memberCreated.identifiers[0].id } });
    }))
    const newChatInsert: InsertResult = await this.chatRepository.createQueryBuilder().insert().into(Chat).values([{
      agreement,
      members: chatMembers
    }]).execute();

    const chatFound: Chat = await this.chatRepository.findOne({ where: { id: newChatInsert.identifiers[0].id } });
    // chatDto;
    return chatFound;
  }

  async createMessage(chatId: UUID, userId: number, message: string) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        messages: {
          user: {
            member: {
              user: true
            }
          }
        },
        agreement: {
          members: true
        }
      },
    });
    const member: ChatMember = await this.chatMemberRepository.findOne({where: {
      member: {
        user: {
          id: userId
        }
      }
    }, relations: {
      member: {
        user: true
      }
    }});
    const messageInsert: InsertResult = await this.chatRepository.createQueryBuilder().insert().into(Message).values([
      {
        message: message,
        chat: chat,
        user: member
      }
    ]).execute();
    return await this.messageRepository.findOne({ where: { id: messageInsert.identifiers[0].id }, relations: {
      user: {
        member: {
          user: true
        }
      },
    } });
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
