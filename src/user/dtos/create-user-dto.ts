import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, isString, IsString, Length, Max, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({description: "Фамилия. Обязательное поле", example: "Максбетов"})
    readonly lastName: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "Имя. Обязательное поле", example: "Максим"})
    readonly firstName: string;


    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "ID Telegram в зашифрованном виде"})
    readonly telegramID: string;
}
