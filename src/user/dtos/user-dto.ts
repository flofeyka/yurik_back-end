import { User } from "../entities/user.entity";

export class UserDto {
    constructor(user: User) {
        Object.assign(this, {
            id: user.id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            middleName: user.middleName, 
            birthDate: user.BirthDate, 
            telegramID: user.telegram_account.telegramID, 
            email: user.email,
            filled: !!(user.authority && user.serial && user.number && user.address && !!user.TIN)})
    }
}