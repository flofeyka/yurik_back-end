import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDialogDto {
  @IsString()
  @ApiProperty({ title: 'Название диалога', example: 'Диалог о дружбе' })
  title: string;

  @IsString()
  @ApiProperty({
    title: 'Фотография(Название)',
    example: 'gsdfg-4q5gksfd-543gfs-2fdf.png',
  })
  image: string;
}
