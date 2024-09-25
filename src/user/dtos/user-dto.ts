import { ImageDto } from 'src/images/dtos/ImageDto';
import { User } from '../entities/user.entity';

export class UserDto {
  constructor(user: User) {
    Object.assign(this, {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      birthDate: user.BirthDate,
      telegramID: user.telegram_account.telegramID,
      image: user.image ? new ImageDto(user.image) : null,
      email: user.email,
      personalData: user.personalData && {
        authority: user.personalData.authority,
        serial: user.personalData.serial,
        number: user.personalData.number,
        address: user.personalData.address,
        passportDate: user.personalData.passportDate,
        TIN: user.personalData.TIN,
      },
      filled: !!(
        user.personalData?.authority &&
        user.personalData?.serial &&
        user.personalData?.passportDate &&
        user.personalData?.number &&
        user.personalData?.address &&
        user.personalData?.TIN
      ),
    });
  }
}
