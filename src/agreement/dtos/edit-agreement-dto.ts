import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsObject, IsString } from "class-validator";

export class EditAgreementDto {
  @ApiProperty({
    title: "Заголовок договора",
    example: "Договор строительного подряда №5134"
  })
  @IsString()
  public title: string;


  @ApiProperty({
    title: "Описание договора",
    example: "Договор заключается в том, что..."
  })
  @IsString()
  public description: string;

  @ApiProperty({
    title: "Содержание договора",
    example: {
      text: "Обновленный текст договора",
      generate: false
    }
  })
  @IsObject()
  public dealText: {
    text: string,
    generate: boolean
  };

  @IsDateString()
  @ApiProperty({
    title: "Дата начала действия договора",
    example: "2023-12-12"
  })
  public start: string;

  @IsNumber()
  @ApiProperty({
    title: "Стадия договора",
    example: 1
  })
  public stage: number;

  @IsDateString()
  @ApiProperty({ title: "Дата конца действия договора", example: "2024-12-12" })
  public end: string;
}
