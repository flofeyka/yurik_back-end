import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, Max, MaxLength } from 'class-validator';

export class ImagesDto {
  @ApiProperty({ title: 'Список имен картинок из БД', example: ["5fa99059-1859-4a9f-86f0-511ff2762212.jpg"] })
  @IsNotEmpty()
  @IsArray()
  images: string[];
}
