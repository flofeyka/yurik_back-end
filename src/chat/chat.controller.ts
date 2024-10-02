import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestType } from 'types/types';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { UUID } from 'crypto';
import { ChatDto } from './dtos/chat-dto';

@ApiTags('Chats API')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Получение всех чатов пользователя' })
  @Get('/')
  @UseGuards(AuthGuard)
  async getChats(@Req() request: RequestType) {
    return await this.chatService.getChats(request.user.id);
  }

  @ApiOperation({ summary: 'Получение чата и его сообщений по id' })
  @Get('/:chatId')
  @UseGuards(AuthGuard)
  async getChat(@Param('chatId') chatId: UUID): Promise<ChatDto> {
    return await this.chatService.getChat(chatId);
  }
}
