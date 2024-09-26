import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { LegalInformationDto } from 'src/user/dtos/legal-information-dto';

export class CreateAgreementDto {
  @ApiProperty({
    title: 'Заголовок договора',
    example: 'Договор возмездного оказания услуг',
  })
  @IsString()
  readonly title: string;

  @ApiProperty({ title: 'Персональные данные участника договора', example: LegalInformationDto})
  @IsObject()
  readonly personalData: LegalInformationDto;

  @ApiProperty({ title: 'Кто инициирует договор ', example: 'Подрядчик' })
  @IsString()
  readonly initiatorStatus: 'Подрядчик' | 'Заказчик';
}
