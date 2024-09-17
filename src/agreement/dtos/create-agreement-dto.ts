import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsDateString, IsNumber, IsString } from "class-validator";

export class CreateAgreementDto {
  @ApiProperty({ title: "Заголовок договора", example: "Договор возмездного оказания услуг" })
  @IsString()
  readonly title: string;

  // @ApiProperty({title: "Временные детали договора"})
  // @IsString()
  // status: "At work" | "Declined" | "At a lawyer"
  //
  // @ApiProperty({ title: "Содержание договора", example: "" })
  // @IsString()
  // readonly text: string;

  @ApiProperty({title: "Статус инициатора в договоре", example: "client"})
  readonly initiatorStatus: "client" | "contractor";

  @ApiProperty({ title: "Стоимость услуг", example: 15000 })
  @IsNumber()
  readonly price: number;

  @ApiProperty({title: "Участники договора", example: [
      {
        id: 1,
        status: "client"
      }
    ]})
  @IsArray()
  readonly members: Array<{
    userId: number;
    status: "client" | "contractor"
  }>

  // @ApiProperty({ title: "Айди заказчика", example: 123 })
  // @IsNumber()
  // readonly client: number;
  //
  // @ApiProperty({ title: "Айди исполнителя", example: 321 })
  // @IsNumber()
  // readonly contractor: number;

  @ApiProperty({
    title: "Этапы выполнения", example: [
      {
        title: "Закупка материалов",
        images: ["sgshdgh.jpg", "adsgfsdg.jpg"],
        isComplete: true,
        responsible: 12,
        comment: "Заказчик обязуется...",
        start: "12-12-2023",
        end: "14-12-2025"
      }]
  })
  @IsArray()
  readonly steps: Array<{
    title: string;
    images: Array<string>,
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