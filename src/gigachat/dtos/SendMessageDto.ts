import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class SendMessageDto {
    @ApiProperty({title: 'Сообщение нейросети', description: "Сообщение. Обязательное поле", example: "Привет, как дела?"})
    @IsString()
    message: string

    @ApiProperty({title: "Айди чата"})
    @IsUUID()
    dialog_id: UUID;
}