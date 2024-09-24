import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendMessageDto } from './dtos/SendMessageDto';
import { GigachatService } from './gigachat.service';
import { AuthGuard } from '../auth/auth.guard';
import { RequestType } from '../../types/types';
import { CreateDialogDto } from './dtos/create-dialog-dto';
import { UUID } from 'crypto';
import { DialogsDto } from './dtos/dialogs-dto';
import { GigaChatDialog } from './entities/dialog.entity';

@ApiTags('Gigachat API')
@Controller('gigachat')
export class GigachatController {
  constructor(private readonly gigachatService: GigachatService) {}

  @ApiOperation({ summary: 'Получить список диалогов ' })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '3b94ab61-6174-4aa8-8e2f-ed008358ff92',
        name: 'Testing name',
        imgUrl: 'http://api.yurik.ru/images/picture/uuid.jpg',
        lastMessage: {
          role: 'user',
          content: 'Как дела?',
          created_at: '2024-09-22T05:12:18.835Z',
        },
      },
    ],
  })
  @Get('/dialogs')
  @UseGuards(AuthGuard)
  async getDialogs(@Req() request: RequestType): Promise<DialogsDto[]> {
    return this.gigachatService.getDialogs(request.user.id);
  }

  @ApiOperation({ summary: 'Получить список сообщений у диалога' })
  @ApiResponse({
    example: {
      id: '945926aa-00b4-483d-97fc-f3c2af051f38',
      title: 'Тестовый диалог',
      messages: [
        {
          id: 'e6be7697-815b-4029-b9c6-17b9099dd2a9',
          role: 'user',
          content: 'какое было предыдующее сообщение?',
          created_at: '2024-09-22T05:12:06.031Z',
        },
        {
          id: 'e545aff3-ee25-4639-b205-0125839e3599',
          role: 'assistant',
          content:
            'Извините, но я не могу предоставить вам предыдущее сообщение, так как я не сохраняю историю чата.',
          created_at: '2024-09-22T05:12:06.651Z',
        },
        {
          id: 'd062d9f1-74ab-4d03-a689-5253459eea3d',
          role: 'user',
          content: 'какое было предыдующее сообщение?',
          created_at: '2024-09-22T05:12:18.119Z',
        },
        {
          id: '7b9fdca2-bf2b-481b-ad1f-c998fdc231d2',
          role: 'assistant',
          content: 'Я уже ответил на этот вопрос.',
          created_at: '2024-09-22T05:12:18.835Z',
        },
      ],
    },
  })
  @Get('/:dialogId/messages')
  @UseGuards(AuthGuard)
  async getMessages(
    @Param('dialogId') dialogId: UUID,
  ): Promise<GigaChatDialog> {
    return await this.gigachatService.getMessages(dialogId);
  }

  @ApiOperation({
    summary: 'Отправка сообщения ИИ и получение от него ответа.',
  })
  @ApiResponse({
    example: {
      content: 'Всё хорошо, спасибо за интерес. А у вас как дела?',
      role: 'assistant',
    },
    description: 'Ответ от GigaChat AI',
    status: HttpStatus.OK,
  })
  @Post('/send')
  @UseGuards(AuthGuard)
  async sendMessage(@Body() messageDto: SendMessageDto): Promise<{
    content: string;
    dialog: UUID;
    role: 'assistant';
  }> {
    return this.gigachatService.sendToGigaChat(messageDto);
  }

  @ApiOperation({ summary: 'Создание диалога с Gigachat' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      id: '3b94ab61-6174-4aa8-8e2f-ed008358ff92',
      name: 'Testing name',
      imgUrl: 'http://api.yurik.ru/images/picture/uuid.jpg',
      lastMessage: null,
    },
  })
  @Post('/dialog/create')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDialog(
    @Req() request: RequestType,
    @Body() createDialogDto: CreateDialogDto,
  ): Promise<DialogsDto> {
    return this.gigachatService.createNewDialog(
      request.user.id,
      createDialogDto,
    );
  }
}
