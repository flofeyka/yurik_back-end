import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({ title: 'Статус клиента в договоре', example: 'Заказчик' })
  status: 'Заказчик' | 'Подрядчик';
}
