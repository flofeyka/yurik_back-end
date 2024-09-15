import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({title: "Номер телефона", example: "79993001234"})
    readonly phoneNumber: string;

    @ApiProperty({title: "Код из СМС", example: 123456})
    readonly code: number;
}
