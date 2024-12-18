import { ApiProperty } from "@nestjs/swagger";
import { Chat } from "../entities/chat.entity";
import { ImageDto } from "src/images/dtos/ImageDto";
import { ChatUser } from "../entities/chat.user";
import { ChatUserDto } from "./chat-user-dto";
import { UUID } from "crypto";
import { ChatMessage } from "../entities/chat.message.entity";

class MessageDto {
    public id: UUID;
    public content: string;
    public created_at: Date;
    public firstName: string;
    public lastName: string;
    public middleName: string;

    constructor(message: ChatMessage) {
        this.id = message.id;
        this.content = message.message;
        this.created_at = message.created_at;
        this.firstName = message.member.user.firstName;
        this.lastName = message.member.user.lastName;
        this.middleName = message.member.user.middleName;
    }
}

export class ChatListDto {
    @ApiProperty({ title: "Айди чата", example: "950c1454-0081-4d59-8e8d-ae4e57307c14" })
    public readonly id: UUID;

    @ApiProperty({ title: "Аватар чата", example: "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png" })
    public readonly image: string;

    @ApiProperty({ title: "Название чата", example: "Вечерний чат с Ургантом"})
    public readonly title: string;

    @ApiProperty({
        title: "Участники чата", example: [
            {
                "id": 10,
                "firstName": "Данил",
                "lastName": "Баширов",
                "middleName": "Владленович",
                "image": "http://localhost:3000/api/images/picture/01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
            }
        ]
    })
    public readonly members: ChatUserDto[]

    @ApiProperty({ title: "Последнее сообщение", example: "Привет. Как дела?" })
    public readonly lastMessage: MessageDto | null;

    constructor(model: Chat) {
        this.id = model.id;
        this.image = new ImageDto(model.image).imgUrl || null;
        this.title = model.title;
        this.members = model.members.map((member: ChatUser) => new ChatUserDto(member));
        this.lastMessage = model.messages.length > 0 ? new MessageDto(model.messages[model.messages.length - 1]) : null;
    }
}