import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
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

  // @ApiOperation({summary: "Авторизация в GigaChat AI"})
  // @ApiResponse({
  //     example: {
  //         access_token: "eyJjdHkiOiJqd3QiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiYWxnIjoiUlNBLU9BRVAtMjU2In0.QW8tOGK4WUY4zHBcoXlu1EnSyrsGp4iR5UG4E7hkHeznBlE1UU4BozSiWiROEER16uQXUzav8LCXwXII-VDDJvZT9L2tvvpY1hSpo5wYhubZArIJ57w2IrvllPKGSxL3d_nKS6y8KWjWA2JJQPtb2wVnmGX-bt9rUo2mIc7wEsYpM2EM02uHt13OzsrgRVEI3RpvTFiKTbRKMfBqXzgsmYYL_4qW5EwRHFPkDjuznACzyGhZpfksOBwLbGwF2Lg4iBfJuiq5kEQWwSrkmRA0-tP11QR7FYHu3Dbm0ccZSIVcFFKKlrxAXR_5cbJnD1FXzw8dWdnbtnpbqt0BjaJWAw.PXBRD3Xhs5Zmb8YKVT6_VQ.MIqV-w_ZtKyK0lKPv65i-ywv8GOqFVjngIUh3bLN2CJssRcmoIT2mA7e5CFplpqSmHGCihAuPo6SE-fjvMGHWFXkcLGP5kLH4XLvUml1_21rVJ5ye8cCSXGLPG1wGJgeXqHHPvYUg85Ji0pyTy8LfFpl2CUCi51sjI5jJwqOFzTRalYk-yXK8uw8oIW_l5M7wa5oanZWt5rORtRzRbMmt2JaTNhdf5eEQlAhGZwRxstlYShGGhN6lw1zSLlj5WqYVlDONbRc-NyHUCEovZTqZlB_Qo6enSJ59wVLskh7ILuyX8gOF6d3nm_b6BUGOd_aFk-Se5ZkybeC-jg9FeyL20aOQTzPi8Eu65MCMkQ2F8ee49T7XuVbBTq6TAd0A8-8SNEwJeCk89fDTAjGEjSjNmHUXN9Yb5krfDTxQkk4f48YbGYQl7i6-Mnkpr0Z8hmaMMVyylVSRdjpeMuqfGKBqiokp9XZSUiZX6O1puGljG7WWnEQ1ujOSEPAdQVOgzTQ_VT4nTRpoSrOnKgfJqIAl3kYU_I2qA76wFCS0naytDW_wLr3h--qI1lkO50xodBa8ZRKw0alDdaaA17NZsItoARtXbrb3JCz1o0GErkCpFTLCv7a4g7sK66tPOgSv73OgWx7v5siR9PqAymhk_CyQ6c5tjqEeJHOLhsO0VWtE5C7jHeLEEAqqBx2bSbwH10OcGsvOMtBrFICmt4sntVHXYD1APRXUYLEJtUrgbaZz04.YHRSS3udg3nWJuEaY62iaTl3tp1ZBj3waONvKUNEukQ",
  //         expires_at: 1725120826761
  //     },
  //     description: "Сохраняется в cookies. Обновляется каждые 30 минут.",
  //     status: HttpStatus.OK
  // })
  // @Get('/auth')
  // async getToken(@Res({ passthrough: true }) response: Response) {
  //     const data = await this.gigachatService.getToken();
  //     response.cookie('gigachat_accessToken', data.access_token);
  //     return data;
  // }

  @ApiOperation({ summary: "Получить список диалогов "})
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

  @ApiOperation({summary: "Создание диалога с Gigachat"})
  @Post("/dialog/create")
  @UseGuards(AuthGuard)
  async createDialog(@Req() request: RequestType) {
    return this.gigachatService.createNewDialog(request.user.id);
  }
}
