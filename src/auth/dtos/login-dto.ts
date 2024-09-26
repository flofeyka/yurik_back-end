import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ title: 'Зашифрованный ID Telegram', example: "dgkfgh34532gfwj==" })
  @IsString()
  readonly telegramID: string;
}
