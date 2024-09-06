import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({title: "Номер телефона", example: "+79993001234"})
    readonly phoneNumber: string;

    @ApiProperty({title: "Пароль(Временно)", example: "qwerty1234"})
    readonly password: string;
}