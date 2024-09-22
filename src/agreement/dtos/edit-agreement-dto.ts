import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsString } from "class-validator";

export class EditAgreementDto {
  @ApiProperty({ title: "Стоимость услуг", example: 15000 })
  @IsNumber()
  readonly price: number;

  @ApiProperty({title: "Участники договора", example: [
      {
        userId: 1,
        status: "Подрядчик"
      }
    ]})
  @IsArray()
  readonly members: Array<{
    userId: number;
    status: "Заказчик" | "Подрядчик"
  }>

  @ApiProperty({
    title: "Этапы выполнения", example: [
      {
        title: "Закупка материалов",
        isComplete: true,
        userId: 12,
        comment: "Заказчик обязуется...",
        start: "12-12-2023",
        end: "14-12-2025"
      }]
  })
  @IsArray()
  readonly steps: Array<{
    title: string;
    userId: number;
    isComplete: boolean,
    comment: string | null,
    start: Date,
    end: Date
  }>;

  @IsDateString()
  @ApiProperty({ title: "Дата начала действия договора", example: "2023-12-12" })
  readonly start: string;

  @IsDateString()
  @ApiProperty({ title: "Дата конца действия договора", example: "2024-12-12" })
  readonly end: string;
}