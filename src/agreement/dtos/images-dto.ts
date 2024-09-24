import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, Max, MaxLength } from 'class-validator';

export class ImagesDto {
  @ApiProperty({ title: 'Список имен картинок из БД' })
  @IsNotEmpty()
  @IsArray()
  images: string[];
}
