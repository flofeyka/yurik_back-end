import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Фамилия. Обязательное поле',
    example: 'Максбетов',
  })
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "Имя. Обязательное поле", example: "Максим" })
  readonly firstName: string;


  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "ID Telegram в зашифрованном виде" })
  readonly telegramID: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: "UUID Ref" })
  readonly ref: UUID;
}
