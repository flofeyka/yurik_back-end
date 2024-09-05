import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class UserInfoDto {
    @ApiProperty({ description: "Имя. Обязательное поле", example: "Максим" })
    readonly firstName: string;

    @IsNotEmpty()
    @ApiProperty({ description: "Фамилия. Обязательное поле", example: "Максбетов" })
    readonly lastName: string;

    @IsString()
    @ApiProperty({ description: "Отчество. Обязательное поле", example: "Тагирович" })
    readonly middleName: string;

    @IsPhoneNumber()
    @ApiProperty({ description: "Номер телефона. Обязательное поле", example: 79123456789 })
    readonly phoneNumber: string;

    @IsEmail()
    @ApiProperty({ description: "Электронная почта", example: "email@admin.ru" })
    readonly email: string;

    @ApiProperty({ description: "Дата рождения", example: "2023-03-22" })
    readonly BirthDate: Date;

}