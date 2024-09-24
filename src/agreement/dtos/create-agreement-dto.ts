import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAgreementDto {
  @ApiProperty({
    title: 'Заголовок договора',
    example: 'Договор возмездного оказания услуг',
  })
  @IsString()
  readonly title: string;

  @ApiProperty({ title: 'Кто инициирует договор ', example: 'Подрядчик' })
  @IsString()
  readonly initiatorStatus: 'Подрядчик' | 'Заказчик';
}
