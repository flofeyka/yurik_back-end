import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({description: "Фамилия. Обязательное поле", example: "Максбетов"})
    lastName: string;

    @IsPhoneNumber()
    @ApiProperty({description: "Номер телефона. Обязательное поле", example: "+79123456789"})
    phoneNumber: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsNotEmpty()
    @ApiProperty({description: "ID Telegram", example: 392210})
    telegramID: number;
}