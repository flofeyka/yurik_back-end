import { ApiProperty } from "@nestjs/swagger";
import { UUID } from "crypto";
import { AgreementMemberDto } from "src/agreement/dtos/agreement-dto";
import { ChatDto } from "./chat-dto";
import { ChatMessage } from "../entities/chat.message.entity";
import { ChatUser } from "../entities/chat.user";
import { ChatUserDto } from "./chat-user-dto";


export class MessageDto {
    @ApiProperty({ title: "Айди сообщения", example: "05508eff-c8dd-4ba8-b617-113f188c06e7" })
    public readonly id: UUID;

    @ApiProperty({
        title: "Данные о пользователе", example: {
            id: 1,
            firstName: "Данил",
            lastName: "Баширов",
            middleName: "Владленович"
        }
    })
    public readonly member: ChatUserDto;

    @ApiProperty({ title: "Айди беседы", example: "950c1454-0081-4d59-8e8d-ae4e57307c14" })
    public readonly chat: {
        id: UUID,
        members: ChatUserDto[]
    }

    @ApiProperty({ title: "Содержание сообщения", example: "Привет. Как дела?" })
    public readonly message: string;

    constructor(model: ChatMessage) {
        this.id = model?.id;
        this.member = new ChatUserDto(model.member);
        this.chat = {
            id: model?.chat?.id,
            members: model?.chat?.members.map((member: ChatUser) => new ChatUserDto(member))
        };
        this.message = model?.message;
    }
}