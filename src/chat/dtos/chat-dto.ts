import { ApiProperty } from "@nestjs/swagger";
import { AgreementDto, AgreementMemberDto } from "src/agreement/dtos/agreement-dto";
import { Chat } from "../entities/chat.entity";
import { ImageDto } from "src/images/dtos/ImageDto";
import { AgreementMember } from "src/agreement/members/member.entity";
import { UUID } from "crypto";
import { Agreement } from "src/agreement/entities/agreement.entity";
import { Message } from "../entities/chat.message.entity";

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
    image: ImageDto;

    @ApiProperty({title: "Участники договора", type: AgreementMember})
    members: AgreementMemberDto[];

    agreement: AgreementChatDto;

    @ApiProperty({title: "Сообщения"})
    messages: Message[]

    constructor(model: Chat) {
        this.id = model.id;
        this.image = new ImageDto(model.image);
        this.members = model.agreement.members.map((member: AgreementMember) => new AgreementMemberDto(member));
        this.agreement = new AgreementChatDto(model.agreement);
        this.messages = model.messages;
    }
}