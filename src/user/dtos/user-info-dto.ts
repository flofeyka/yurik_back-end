import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class UserInfoDto {
  @IsString()
  @ApiProperty({ description: 'Имя. Обязательное поле', example: 'Максим' })
  readonly firstName: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Фамилия. Обязательное поле',
    example: 'Максбетов',
  })
  readonly lastName: string;

  @IsString()
  @ApiProperty({description: "Имя фотографии.", example: "91b95774-3e4e-4b52-93e3-41a0016104f4.jpg"})
  readonly image: string;

  @IsString()
  @ApiProperty({
    description: 'Отчество. Обязательное поле',
    example: 'Тагирович',
  })
  readonly middleName: string;

  @IsString()
  @Length(11, 11)
  @ApiProperty({
    description: 'Номер телефона. Обязательное поле',
    example: '79123456789',
  })
  readonly phoneNumber: string;

  @IsEmail()
  @ApiProperty({ description: 'Электронная почта', example: 'email@admin.ru' })
  readonly email: string;

  @IsDateString({}, { message: "Поле 'BirthDate' должно быть датой либо null" })
  @ApiProperty({ description: 'Дата рождения', example: '2023-03-22' })
  readonly BirthDate: Date;
}
