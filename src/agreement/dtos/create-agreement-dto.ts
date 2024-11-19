import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { LegalInformationDto } from 'src/user/dtos/legal-information-dto';

export class CreateAgreementDto {
  @ApiProperty({
    title: 'Заголовок договора',
    example: 'Договор возмездного оказания услуг',
  })
  @IsString()
  public title: string;

  @ApiProperty({
    title: "Описание договора",
    example: "Суть договора заключается в том, что..."
  })
  @IsString()
  public description: string;

  @ApiProperty({ title: 'Кто инициирует договор ', example: 'Исполнитель' })
  @IsString()
  public initiatorStatus: 'Исполнитель' | 'Заказчик';
}
