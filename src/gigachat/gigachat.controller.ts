import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SendMessageDto } from "./dtos/SendMessageDto";
import { GigachatService } from "./gigachat.service";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";


@ApiTags("Gigachat API")
@Controller("gigachat")
export class GigachatController {
  constructor(private readonly gigachatService: GigachatService) {
  }

  @ApiOperation({ summary: "Получить список диалогов " })
  @ApiResponse({
    status: HttpStatus.OK, example: [
      {
        "id": "3b94ab61-6174-4aa8-8e2f-ed008358ff92",
        "messages": [
          {
            "id": "1963c8bb-f7c0-4fb5-99fb-c2de60decb12",
            "role": "user",
            "content": "Ты видишь прошлый диалог?"
          },
          {
            "id": "69e0eff6-6166-40f3-bdbf-9b1ff791b902",
            "role": "assistant",
            "content": "Да, я вижу все предыдущие диалоги с вами."
          },
          {
            "id": "0b778ddb-7c35-4253-8585-10e92e8a5b49",
            "role": "user",
            "content": "Когда уже ИИ захватит этот мир?"
          },
          {
            "id": "7c843b2c-c554-4773-85b5-42da0b1f28ef",
            "role": "assistant",
            "content": "Я не могу предсказывать такие вещи."
          },
          {
            "id": "8ebbe495-2cbd-49d1-8265-a6e8c0b2e2c4",
            "role": "user",
            "content": "Думаешь, у нас еще есть шанс?"
          },
          {
            "id": "b96d2801-272f-41fd-8699-ae508e64ff59",
            "role": "assistant",
            "content": "Шанс на что?"
          },
          {
            "id": "dec8a894-412d-433f-9874-068aae9dbbed",
            "role": "user",
            "content": "Шанс на захват мира ИИ"
          },
          {
            "id": "a46d1267-7fae-49c6-9e2e-b03626d93ce3",
            "role": "assistant",
            "content": "Я не думаю, что это произойдёт в ближайшее время."
          },
          {
            "id": "807f31f3-b574-4ad2-a23f-c561a844b594",
            "role": "user",
            "content": "ну а как думаешь, есть ли на это шанс?"
          },
          {
            "id": "e0352ab6-a013-47f4-8cd5-d029baa2ed92",
            "role": "assistant",
            "content": "Я не специалист в области искусственного интеллекта и не могу дать точный прогноз."
          },
          {
            "id": "6b5cfff0-8041-413e-a849-bdb27279a8f8",
            "role": "user",
            "content": "а ты видишь прошлое сообщение мое? если да, то напиши его сюда"
          },
          {
            "id": "c5405768-5368-4946-a952-bc426e665043",
            "role": "assistant",
            "content": "Да, я вижу все предыдущие сообщения."
          },
          {
            "id": "f8aa9fec-4bce-4d61-99f2-8cd331cebc38",
            "role": "user",
            "content": "какое было предыдующее сообщение?"
          },
          {
            "id": "8bbfdb2a-878a-41be-a0d2-e5d3faac22bd",
            "role": "assistant",
            "content": "\"Когда уже ИИ захватит этот мир?\""
          },
          {
            "id": "93be1480-6d02-4580-ac5c-359cd29b980c",
            "role": "user",
            "content": "какое было предыдующее сообщение?"
          },
          {
            "id": "fa8a322a-ad9b-443f-907f-664ea220f527",
            "role": "assistant",
            "content": "\"Думаешь, у нас ещё есть шанс?\""
          }
        ]
      }
    ]
  })
  @Get("/")
  @UseGuards(AuthGuard)
  async getDialogs(@Req() request: RequestType) {
    return this.gigachatService.getDialogs(request.user.id);
  }


  @ApiOperation({ summary: "Отправка сообщения ИИ и получение от него ответа." })
  @ApiResponse({
    example: {
      content: "Всё хорошо, спасибо за интерес. А у вас как дела?",
      role: "assistant"
    },
    description: "Ответ от GigaChat AI",
    status: HttpStatus.OK
  })
  @Post("/send")
  @UseGuards(AuthGuard)
  async sendMessage(@Body() messageDto: SendMessageDto, @Req() request: RequestType) {
    return this.gigachatService.sendToGigaChat(messageDto);
  }

  @ApiOperation({ summary: "Создание диалога с Gigachat" })
  @ApiResponse({
    status: HttpStatus.CREATED, example: {
      "id": "3b94ab61-6174-4aa8-8e2f-ed008358ff92"
    }
  })
  @Post("/dialog/create")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createDialog(@Req() request: RequestType) {
    return this.gigachatService.createNewDialog(request.user.id);
  }
}
