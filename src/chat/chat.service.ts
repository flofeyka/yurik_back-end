import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { ChatListDto } from './dtos/chat-list-dto';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messageRepository: Repository<ChatMessage>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatUser)
    private readonly chatUserRepository: Repository<ChatUser>,
    private readonly userService: UserService,
  ) {}

  public async getChat(chatId: UUID): Promise<ChatDto> {
    const chatFound: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        messages: true,
      },
    });
    if (!chatFound) {
      throw new NotFoundException('Чат не найден');
    }
    return new ChatDto(chatFound);
  }

  public async createChatUser(id: number): Promise<ChatUser> {
    const foundUser: User = await this.userService.findUser(id);
    const chatUserFound = await this.chatUserRepository.findOne({
      where: { user: { id: foundUser.id } },
      relations: {
        chats: {
          members: {
            user: true,
          },
          messages: {
            chat: true,
            member: {
              user: true,
            },
          },
        },
      },
    });
    if (chatUserFound) {
      return chatUserFound;
    }

    const newChatUser = await this.chatUserRepository
      .createQueryBuilder()
      .insert()
      .into(ChatUser)
      .values([
        {
          user: foundUser,
        },
      ])
      .execute();

    return await this.chatUserRepository.findOneBy({
      id: newChatUser.identifiers[0].id,
    });
  }

  public async addChat(users: { id: number }[], title: string): Promise<Chat> {
    const members = await Promise.all(
      users.map(async (user: User) => await this.createChatUser(user.id)),
    );
    const newChat = await this.chatRepository.save({
      members,
      title,
    });

    return newChat;
  }

  async createChat(
    users: { id: number }[] = [],
    userId: number,
    title,
  ): Promise<ChatDto> {
    if (users?.find((user) => user.id === userId)) {
      throw new BadRequestException('Нельзя создать чат с самим собой');
    }
    const newChat = await this.addChat([...users, { id: userId }], title);
    return new ChatDto(newChat);
  }

  async addMember(
    chatId: UUID,
    memberId: number,
    user: {
      id: number;
      isAdmin: boolean;
    },
  ): Promise<ChatDto> {
    const chat: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        members: true,
      },
    });
    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }
    if (
      !chat.members.find((member) => member.user.id === user.id) &&
      !user.isAdmin
    ) {
      throw new BadRequestException(
        'Вы не являетесь участником чата, чтобы пригласить пользователя',
      );
    }
    const member: ChatUser = await this.chatUserRepository.findOneBy({
      user: { id: memberId },
    });
    chat.members.push(member);
    await this.chatRepository.save(chat);
    return new ChatDto(chat);
  }

  async deleteMember(
    chatId: UUID,
    memberId: number,
    userId: number,
  ): Promise<ChatDto> {
    const chat: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        members: true,
      },
    });
    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }
    if (!chat.members.find((member: ChatUser) => member.user.id === userId)) {
      throw new BadRequestException(
        'Вы не являетесь участником чата, чтобы удалить пользователя',
      );
    }
    const Member: ChatUser = await this.chatUserRepository.findOneBy({
      user: { id: memberId },
    });
    chat.members = chat.members.filter((member) => member.id !== Member.id);
    await this.chatRepository.save(chat);
    return new ChatDto(chat);
  }

  async createMessage(
    chatId: UUID,
    userId: number,
    message: string,
  ): Promise<MessageDto> {
    const chat: Chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: {
        messages: true,
        members: {
          user: true,
        },
      },
    });
    if (!chat.members.find((member) => member.user.id === userId)) {
      throw new WsException('Вы не являетесь участником чата');
    }
    const member: ChatUser = await this.chatUserRepository.findOneBy({
      user: { id: userId },
    });
    const newMessage: InsertResult = await this.messageRepository
      .createQueryBuilder()
      .insert()
      .into(ChatMessage)
      .values({
        member,
        chat,
        message,
      })
      .execute();

    const newMessageFound: ChatMessage = await this.messageRepository.findOne({
      where: {
        id: newMessage.identifiers[0].id,
      },
      relations: {
        member: {
          user: true,
        },
        chat: {
          members: {
            user: true,
          },
        },
      },
    });

    return new MessageDto(newMessageFound);
  }

  async getChats(userId: number): Promise<ChatListDto[]> {
    const chats: Chat[] = await this.chatRepository.find({
      where: {
        members: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        members: {
          user: true,
        },
        messages: {
          chat: true,
        },
      },
    });

    return chats.map((chat: Chat) => new ChatListDto(chat));
  }
}
