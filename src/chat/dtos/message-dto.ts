import { ApiProperty } from "@nestjs/swagger";
import { UUID } from "crypto";
import { AgreementMemberDto } from "src/agreement/dtos/agreement-dto";
import { ChatDto } from "./chat-dto";
import { ChatMessage } from "../entities/chat.message.entity";
import { ChatUser } from "../entities/chat.user";


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
    public readonly member: {
        id: number;
        firstName: string;
        lastName: string;
        middleName: string;
    };

    @ApiProperty({ title: "Айди беседы", example: "950c1454-0081-4d59-8e8d-ae4e57307c14" })
    public readonly chat: {
        id: UUID,
        members: {
            id: number;
            firstName: string;
            lastName: string;
            middleName: string;
        }[]
    }

    @ApiProperty({ title: "Содержание сообщения", example: "Привет. Как дела?" })
    public readonly message: string;

    constructor(model: ChatMessage) {
        this.id = model.id;
        this.member = {
            id: model.member.user.id,
            firstName: model.member.user.firstName,
            lastName: model.member.user.lastName,
            middleName: model.member.user.middleName
        };
        this.chat = {
            id: model.chat.id,
            members: model.chat.members.map((member: ChatUser) => {
                return {
                    id: member.user.id,
                    firstName: member.user.firstName,
                    lastName: member.user.lastName,
                    middleName: member.user.middleName
                }
            })
        };
        this.message = model.message;
    }
}