import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({description: "Фамилия. Обязательное поле", example: "Максбетов"})
    readonly lastName: string;

    @IsPhoneNumber()
    @ApiProperty({description: "Номер телефона. Обязательное поле", example: "+79123456789"})
    readonly phoneNumber: string;

    @IsString()
    @MinLength(8)
    readonly password: string;

    @IsNotEmpty()
    @ApiProperty({description: "ID Telegram", example: 392210})
    readonly telegramID: number;
}
