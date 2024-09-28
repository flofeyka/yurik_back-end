import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class EditAgreementDto {
  @ApiProperty({
    title: 'Содержание договора',
    example: 'Заказчик обязуется...',
  })
  @IsString()
  readonly text: string;

  @IsDateString()
  @ApiProperty({
    title: 'Дата начала действия договора',
    example: '2023-12-12',
  })
  readonly start: string;

  @IsDateString()
  @ApiProperty({ title: 'Дата конца действия договора', example: '2024-12-12' })
  readonly end: string;
}
