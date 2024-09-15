import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsInt, IsNumber, IsString, Length, Max, Min } from "class-validator";

export class LegalInformationDto {
    @IsString({ message: "Поле 'authority' должно быть либо строкой, либо null"})
    @ApiProperty({ description: "Кем выдан паспорт", example: "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ", type: String })
    readonly authority: string | null | undefined;

    @IsString({ message: "Поле 'serial' должно быть либо строкой, либо null"})
    @ApiProperty({ description: "Серия паспорта", example: 7212, type: Number })
    readonly serial: string | null;

    @IsString({ message: "Поле 'number' должно быть либо строкой, либо null"})
    @ApiProperty({ description: "Номер паспорта", example: 314513, type: Number })
    readonly number: string | null;

    @IsString({ message: "Поле 'address' должно быть либо строкой, либо null"})
    @ApiProperty({ description: "Адрес прописки", example: "Тюменская область, город Тюмень, Улица Мориса Тореза, 1, 1", type: String })
    readonly address: string | null;

    @IsDateString({}, { message: "Поле 'passportDate' должно быть датой, либо null" })
    @ApiProperty({ description: "Паспорт выдан", example: "25-08-2019" })
    readonly passportDate: string | null;

    @IsString({ message: "Поле 'TIN' должно быть либо строкой, либо null"})
    @ApiProperty({ description: "ИНН", example: "252251458401", type: Number })
    readonly TIN: string | null;
}