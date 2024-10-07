import { ApiProperty } from "@nestjs/swagger";
import { AgreementDto, AgreementMemberDto } from "src/agreement/dtos/agreement-dto";
import { Chat } from "../entities/chat.entity";
import { ImageDto } from "src/images/dtos/ImageDto";
import { AgreementMember } from "src/agreement/members/member.entity";
import { UUID } from "crypto";
import { Agreement } from "src/agreement/entities/agreement.entity";
import { ChatMessage } from "../entities/chat.message.entity";
import { ChatUser } from "../entities/chat.user";
import { ChatUserDto } from "./chat-user-dto";
import { MessageDto } from "./message-dto";

export class AgreementChatDto {
    @ApiProperty({ title: "Айди договора" })
    id: number;

    @ApiProperty({ title: "Заголовок договора " })
    title: string;

    constructor(model: Agreement) {
        this.id = model.id;
        this.title = model.title;
    }
}

export class ChatDto {
    @ApiProperty({ title: "Уникальный ID чата", example: "54d559d1-90f4-4e78-9ed0-fbec43b14097" })
    id: UUID;

    @ApiProperty({ title: "Картинка.", example: "http://localhost:3000/api/images/picture/1aad9b7b-771a-4a37-823c-8de2dd4a8f02.jpg" })
    image: string;

    @ApiProperty({ title: "Участники договора", type: AgreementMember })
    members: ChatUserDto[];

    @ApiProperty({ title: "Сообщения" })
    messages: MessageDto[]

    constructor(model: Chat) {
        this.id = model.id;
        this.image = new ImageDto(model.image).imgUrl || null;
        this.members = model.members.map((member: ChatUser) => new ChatUserDto(member));
        this.messages = model.messages?.map((message: ChatMessage) => new MessageDto(message));
    }
}