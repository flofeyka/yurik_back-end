import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsObject, IsString } from "class-validator";
import { ImagesDto } from "src/agreement/dtos/images-dto";

export class EditStepDto {
    @ApiProperty({ title: "Заголовок шага", example: "Закупка материалов" })
    @IsString()
    public readonly title: string;

    @ApiProperty({ title: "ID ответственного за шаг", example: 12 })
    @IsNumber()
    public readonly userId: number;

    @ApiProperty({ title: "Комментарий шага", example: "Заказчик обязуется..." })
    @IsString()
    public readonly comment: string;

    @ApiProperty({ title: "Дата начала", example: "12-12-2023" })
    @IsDateString()
    public readonly start: Date;

    @ApiProperty({
        title: "Платежные данные", example: {
            price: 231432

        }
    })
    @IsObject()
    public readonly payment: {
        price: number;
    } | undefined;

    @ApiProperty({
        title: "Картинки", example: ImagesDto
    })
    @IsArray()
    public readonly images: string[];

    @ApiProperty({ title: "Дата окончания", example: "14-12-2025" })
    @IsDateString()
    public readonly end: Date;
}