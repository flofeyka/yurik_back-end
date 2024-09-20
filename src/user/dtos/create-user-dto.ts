import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString, Length, Max, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @ApiProperty({description: "Фамилия. Обязательное поле", example: "Максбетов"})
    readonly lastName: string;


    @Length(11)
    @ApiProperty({description: "Номер телефона. Обязательное поле", example: "+79123456789"})
    readonly phoneNumber: string;

    
    @IsNotEmpty()
    @ApiProperty({description: "СМС-код", example: 123456})
    readonly code: number;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({description: "ID Telegram в зашифрованном виде"})
    readonly telegramID: string | number;
}
