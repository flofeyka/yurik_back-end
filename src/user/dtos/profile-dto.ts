import { ImageDto } from "src/images/dtos/ImageDto";
import { User } from "../entities/user.entity";

export class ProfileDto {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
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