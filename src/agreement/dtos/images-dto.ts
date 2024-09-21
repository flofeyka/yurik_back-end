import { ApiProperty } from "@nestjs/swagger";

export class ImagesDto {
  @ApiProperty({ title: "Список имен картинок из БД" })
  images: string[];
}