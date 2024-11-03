import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class EditAgreementDto {
  @ApiProperty({
    title: "Заголовок договора",
    example: 'Договор строительного подряда №5134'
  })
  @IsString()
  public readonly title: string;

  @ApiProperty({
    title: 'Содержание договора',
    example: 'Заказчик обязуется...',
  })
  @IsString()
  public readonly text: string;

  @IsDateString()
  @ApiProperty({
    title: 'Дата начала действия договора',
    example: '2023-12-12',
  })
  public readonly start: string;

  @IsNumber()
  @ApiProperty({
    title: "Стадия договора",
    example: 1
  })
  public readonly stage: number;

  @IsDateString()
  @ApiProperty({ title: 'Дата конца действия договора', example: '2024-12-12' })
  public readonly end: string;
}
