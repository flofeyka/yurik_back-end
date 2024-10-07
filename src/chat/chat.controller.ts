import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestType } from 'types/types';
import { ChatService } from './chat.service';
import { ChatDto } from './dtos/chat-dto';

@ApiTags('Chats API')
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @ApiOperation({ summary: 'Получение всех чатов пользователя' })
  @ApiResponse({
    status: 200, example: [
      {
        "id": "c6f13880-d484-4b00-ac30-f05ba418d518",
        "image": null,
        "members": [
          {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          }
        ]
      }], isArray: true
  })
  @Get('/')
  @UseGuards(AuthGuard)
  async getChats(@Req() request: RequestType) {
    return await this.chatService.getChats(request.user.id);
  }

  @ApiOperation({ summary: 'Получение чата и его сообщений по id' })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      "id": "d2be6e11-1205-4036-badf-96a6e7674496",
      "image": null,
      "members": [
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
        }
      ],
      "messages": []
    }
  })
  @Get('/:chatId')
  @UseGuards(AuthGuard)
  async getChat(@Param('chatId') chatId: UUID): Promise<ChatDto> {
    return await this.chatService.getChat(chatId);
  }

  @ApiOperation({ summary: "Создание чата с одним, либо с несколькими участниками" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      "id": "b22052bf-a152-4413-8bb3-9e21914a0eb0",
      "image": null,
      "members": [
        {
          "id": 9,
          "firstName": "Николай",
          "lastName": "Бойченко",
          "middleName": "Николаевич",
          "image": null
        },
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
        }
      ]
    }
  })
  @ApiBadRequestResponse({
    example: {
      "message": "Нельзя создать чат с самим собой",
      "error": "Bad Request",
      "statusCode": 400
    }
  })
  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createChat(@Body() {
    users
  }: { users: Array<{ id: number }> }, @Req() request: RequestType) {
    return await this.chatService.createChat(users, request.user.id);
  }

  @ApiOperation({ summary: "Добавление участника в чат" })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    example: {
      "id": "26b8f427-3621-47c2-bdea-08fd92c4d785",
      "image": null,
      "members": [
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
        },
        {
          "id": 9,
          "firstName": "Николай",
          "lastName": "Бойченко",
          "middleName": "Николаевич",
          "image": null
        }
      ],
      "messages": [
        {
          "id": "80f9fe2b-fcdf-44c1-9a23-3378983e13a3",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "5d63ed04-6fcf-494b-96b4-86961d1459da",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "9cd3121f-1a29-4cec-9d72-3100fcb543ec",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "b529bae8-372c-4768-856a-2a0a64e0bd53",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "773306d5-6b8f-4638-872b-182810f14ff9",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "53e690c7-d460-46e0-bc73-3aeb97fb84aa",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "e01e20f6-f9d7-423b-9766-be998cd95ec6",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "7830a0a8-65b9-40cd-8944-2735f6773893",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        }
      ]
    }
  })
  @Post("/:chatId/member")
  @UseGuards(AuthGuard)
  async addMember(@Param('chatId') chatId: UUID, @Query('userId') userId: number, @Req() request: RequestType) {
    return await this.chatService.addMember(chatId, userId, request.user.id);
  }

  @ApiOperation({ summary: "Удаление участника из чата" })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    example: {
      "id": "26b8f427-3621-47c2-bdea-08fd92c4d785",
      "image": null,
      "members": [
        {
          "id": 10,
          "firstName": "Данил",
          "lastName": "Баширов",
          "middleName": "Владленович",
          "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
        }
      ],
      "messages": [
        {
          "id": "80f9fe2b-fcdf-44c1-9a23-3378983e13a3",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "5d63ed04-6fcf-494b-96b4-86961d1459da",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "9cd3121f-1a29-4cec-9d72-3100fcb543ec",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "b529bae8-372c-4768-856a-2a0a64e0bd53",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "773306d5-6b8f-4638-872b-182810f14ff9",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "53e690c7-d460-46e0-bc73-3aeb97fb84aa",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "e01e20f6-f9d7-423b-9766-be998cd95ec6",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        },
        {
          "id": "7830a0a8-65b9-40cd-8944-2735f6773893",
          "member": {
            "id": 10,
            "firstName": "Данил",
            "lastName": "Баширов",
            "middleName": "Владленович",
            "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
          },
          "chat": {},
          "message": "haha"
        }
      ]
    }
  })
  @Delete("/:chatId/member")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(AuthGuard)
  async removeMember(@Param('chatId') chatId: UUID, @Query('userId') userId: number, @Req() request: RequestType) {
    return await this.chatService.deleteMember(chatId, userId, request.user.id);
  }
}
