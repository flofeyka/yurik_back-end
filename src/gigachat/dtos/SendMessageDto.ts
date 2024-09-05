import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendMessageDto {
    @ApiProperty({title: 'Сообщение нейросети', description: "Сообщение. Обязательное поле", example: "Привет, как дела?"})
    @IsString()
    message: string
}