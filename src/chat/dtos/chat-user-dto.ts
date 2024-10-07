import { ChatUser } from "../entities/chat.user";

export class ChatUserDto {
    public id: number;
    public firstName: string;
    public lastName: string;
    public middleName: string;
    public image: string;
    constructor(model: ChatUser) {
        this.id = model.user.id;
        this.firstName = model.user.firstName;
        this.lastName = model.user.lastName;
        this.middleName = model.user.middleName;
        this.image = model.user?.image?.name ? `${process.env.API_URL}/images/picture/${model?.user?.image?.name}` : null;
    }
}