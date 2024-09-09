import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNumber, IsObject, IsString } from "class-validator";

export class CreateAgreementDto {
  @ApiProperty({ title: "Заголовок договора", example: "Договор возмездного оказания услуг" })
  @IsString()
  readonly title: string;

  @ApiProperty({title: 'Инициатор договора', example: "client"})
  @IsString()
  readonly initiator: "client" | "contractor"

  // @ApiProperty({title: "Временные детали договора"})
  // @IsString()
  // status: "At work" | "Declined" | "At a lawyer"
  //
  // @ApiProperty({ title: "Содержание договора", example: "" })
  // @IsString()
  // readonly text: string;

  @ApiProperty({title: 'Пароль от аккаунта', example: "qwerty123456"})
  @IsString()

  readonly password: string;

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
    id: number;
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
    responsible: number;
    isComplete: boolean,
    comment: string | null,
    start: Date,
    end: Date
  }>;

  @ApiProperty({ title: "Дата начала действия договора", example: "12-12-2023" })
  readonly start: any;

  @ApiProperty({ title: "Дата конца действия договора", example: "14-12-2024" })
  readonly end: any;
}