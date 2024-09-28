import { ImageDto } from 'src/images/dtos/ImageDto';
import { User } from '../entities/user.entity';

export class UserDto {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  birthDate: Date;
  phoneNumber: string;
  telegramID: number;
  image: string;
  email: string;
  personalData: {
    authority: string;
    serial: string;
    number: string;
    address: string;
    passportDate: Date;
    TIN: string;
  }
  filled: boolean;


  constructor(user: User) {
      this.id = user.id,
      this.firstName = user.firstName,
      this.lastName = user.lastName,
      this.phoneNumber = user.phoneNumber,
      this.middleName = user.middleName,
      this.birthDate = user.BirthDate,
      this.telegramID = user.telegram_account.telegramID,
      this.image = user.image ? new ImageDto(user.image).imgUrl : null,
      this.email = user.email,
      this.personalData = user.personalData && {
        authority: user.personalData.authority,
        serial: user.personalData.serial,
        number: user.personalData.number,
        address: user.personalData.address,
        passportDate: user.personalData.passportDate,
        TIN: user.personalData.TIN,
      },
      this.filled = !!(
        user.firstName &&
        user.lastName &&
        user.middleName &&
        user.email &&
        user.phoneNumber &&
        user.BirthDate &&
        user.personalData?.authority &&
        user.personalData?.serial &&
        user.personalData?.passportDate &&
        user.personalData?.number &&
        user.personalData?.address &&
        user.personalData?.TIN
      )
  }
}
