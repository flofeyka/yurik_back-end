import { ImageDto } from "src/images/dtos/ImageDto";
import { User } from "../entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileDto {
    @ApiProperty({title: "Айди юзера", example: 1})
    id: number;
    @ApiProperty({title: "Имя", example: "Иван"})
    firstName: string;
    @ApiProperty({title: "Фамилия", example: "Иванов"})
    lastName: string;
    @ApiProperty({title: "Отчество", example: "Иванович"})
    middleName: string;
    @ApiProperty({title: "Номер телефона", example: "79942542123"})
    phoneNumber: string;
    @ApiProperty({description: "Имя фотографии.", example: "https://url.ru/images/91b95774-3e4e-4b52-93e3-41a0016104f4.jpg"})
    image: string;
  
  
    constructor(user: User) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.middleName = user.middleName;
        this.phoneNumber = user.phoneNumber;
        this.image = user.image ? new ImageDto(user.image).imgUrl : null;
    }
}