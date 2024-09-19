import { ApiProperty } from "@nestjs/swagger";
import { IsString, Max, Min } from "class-validator";

export class LoginDto {
    @ApiProperty({title: "Номер телефона", example: "79993001234"})
    @IsString()
    readonly phoneNumber: string;

    @ApiProperty({title: "Код из СМС", example: 123456})
    @Min(100000)
    @Max(999999)
    readonly code: number;
}
