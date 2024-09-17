import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { RequestType } from 'types/types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Message } from './entities/chat.message.entity';
import { Chat } from './entities/chat.entity';
import { AuthGuard } from 'src/auth/auth.guard';


@ApiTags("Chats API")
@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @ApiOperation({summary: "Получение всех чатов пользователя"})
    @Get('/')
    @UseGuards(AuthGuard)
    async getChats(@Req() request: RequestType) {
        return await this.chatService.getChats(request.user.id);
    }

    @ApiOperation({summary: "Получение чата и его сообщений по id"})
    @Get('/:chatId')
    @UseGuards(AuthGuard)
    async getChat(@Param('chatId') chatId: number): Promise<Chat> {
        return await this.chatService.getChat(chatId);
    }
}
