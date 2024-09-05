import { User } from "../user.entity";

export class UserDto {
    constructor(user: User) {
        Object.assign(this, {
            id: user.id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            middleName: user.middleName, 
            birthDate: user.BirthDate, 
            telegramID: user.telegramID, 
            email: user.email, 
            passport: user.authority && user.serial && user.number && user.address ? true : false, TIN: user.TIN ? true : false})
    }
}