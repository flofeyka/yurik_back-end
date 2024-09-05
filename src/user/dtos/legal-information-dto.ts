import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsInt, IsNumber, IsString, Length, Max, Min } from "class-validator";

export class LegalInformationDto {
    @IsString()
    @ApiProperty({ description: "Кем выдан паспорт", example: "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ", type: String })
    readonly authority: string | null | undefined;

    @ApiProperty({ description: "Серия паспорта", example: 7212, type: Number })
    readonly serial: any;

    @ApiProperty({ description: "Номер паспорта", example: 314513, type: Number })
    readonly number: any;

    @IsString()
    @ApiProperty({ description: "Адрес прописки", example: "Тюменская область, город Тюмень, Улица Мориса Тореза, 1, 1", type: String })
    readonly address: string;

    @ApiProperty({ description: "Паспорт выдан", example: "25-08-2019" })
    readonly passportDate: any;

    @ApiProperty({ description: "ИНН", example: "252251458401", type: Number })
    readonly TIN: any;
}