import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsString } from "class-validator";

export class CreateAgreementDto {
  @ApiProperty({ title: "Заголовок договора", example: "Договор возмездного оказания услуг" })
  @IsString()
  readonly title: string;

  @ApiProperty({ title: "Кто инициирует договор ", example: "Подрядчик"})
  readonly initiatorStatus: "Подрядчик" | "Заказчик"
}