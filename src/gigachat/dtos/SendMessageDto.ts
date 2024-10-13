import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class SendMessageDto {
  @ApiProperty({
    title: 'Сообщение нейросети',
    description: 'Сообщение. Обязательное поле',
    example: 'Привет, как дела?',
  })
  @IsString()
  message: string;

  
  @ApiProperty({
    title: 'Айди чата',
    example: '3b94ab61-6174-4aa8-8e2f-ed008358ff92',
  })
  @IsUUID()
  dialog_id: UUID;
}
