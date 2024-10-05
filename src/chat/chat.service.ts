import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Agreement } from 'src/agreement/entities/agreement.entity';
import { AgreementMember } from 'src/agreement/members/member.entity';
import { InsertResult, Repository } from 'typeorm';
import { ChatDto } from './dtos/chat-dto';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat.message.entity';
import { MessageDto } from './dtos/message-dto';
import { User } from 'src/user/entities/user.entity';
import { ChatUser } from './entities/chat.user';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatUser) private readonly chatUserRepository: Repository<ChatUser>,
    private readonly userService: UserService
  ) { }

  public async getChat(chatId: UUID): Promise<ChatDto> {
    const chatFound: Chat = await this.chatRepository.findOneBy({ id: chatId });

    return new ChatDto(chatFound);
  }

  public async createChatUser(id: number): Promise<ChatUser> {
    const foundUser: User = await this.userService.findUser(id);
    const chatUserFound = await this.chatUserRepository.findOne({
      where: { user: { id: foundUser.id } }, relations: {
        chats: true
      }
    });
    if (chatUserFound) {
      return chatUserFound;
    }

    const newChatUser = await this.chatUserRepository.createQueryBuilder().insert().into(ChatUser).values([{
      user: foundUser
    }]).execute();

    return await this.chatUserRepository.findOneBy({ id: newChatUser.identifiers[0].id })
  }


  public async createChat(users: { id: number }[]): Promise<Chat> {
    const members = await Promise.all(users.map(async (user: User) => await this.createChatUser(user.id)));
    const newChat = await this.chatRepository.save({
      members
    })
    return newChat;
  }

  async createMessage(chatId: UUID, userId: number, message: string): Promise<MessageDto> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        messages: true
      },
    });
    console.log(chat);
    const member = await this.chatUserRepository.findOneBy({ user: { id: userId } });
    const newMessage = await this.messageRepository.save({
      member,
      chat,
      message
    });
    console.log(newMessage);
    // const messageInsert: InsertResult = await this.chatRepository.createQueryBuilder().insert().into(ChatMessage).values([
    //   {
    //     message: message,
    //     chat: chat,

    //   }
    // ]).execute();
    // const newMessage = await this.messageRepository.findOne({
    //   where: { id: messageInsert.identifiers[0].id }, relations: {
    //     chat: {
    //       members: {
    //         user: true
    //       }
    //     }
    //   }
    // });
    // console.log(newMessage.chat);

    return new MessageDto(newMessage);
  }

  async getChats(userId: number) {
    const chats = await this.chatRepository.find({
      where: {
        members: {
          user: {
            id: userId
          }
        }
      },
      relations: {
        members: {
          user: true
        }
      }
    });

    return chats;
  }
}
