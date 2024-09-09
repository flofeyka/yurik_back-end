import { ApiProperty } from "@nestjs/swagger";

export class AgreementConfirmDto {
  @ApiProperty({title: "Код с СМС", example: 123531})
  code: number;
}