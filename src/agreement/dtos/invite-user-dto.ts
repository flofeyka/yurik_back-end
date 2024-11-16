import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { LegalInformationDto } from 'src/user/dtos/legal-information-dto';

export class InviteUserDto {
  @ApiProperty({ title: 'Статус клиента в договоре', example: 'Заказчик' })
  @IsString()
  status: 'Заказчик' | 'Исполнитель';
}
