import { ApiProperty } from "@nestjs/swagger";

export class AgreementConfirmDto {
  @ApiProperty({title: "Пока что пароль.", example: 'qwerty123456'})
  password: string;
}