import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsObject, IsString } from 'class-validator';

class paymentStep {
  @IsNumber()
  price: number;
}

export class Step {
  @IsNumber()
  id: number | undefined;
  @IsString()
  title: string;
  @IsNumber()
  userId: number;
  @IsObject()
  payment: paymentStep
  @IsString()
  comment: string | null;
  @IsDateString()
  start: Date;
  @IsDateString()
  end: Date;
}

export class StepDto {
  @ApiProperty({
    title: 'Этап выполнения',
    example: {
      title: 'Закупка материалов',
      userId: 12,
      comment: 'Заказчик обязуется...',
      start: '12-12-2023',
      end: '14-12-2025',
    },
  })
  step: Step;
}

export class EditStepsDto {
  @ApiProperty({
    title: 'Этапы выполнения',
    example: [
      {
        title: 'Закупка материалов',
        userId: 12,
        comment: 'Заказчик обязуется...',
        start: '12-12-2023',
        end: '14-12-2025',
      },
    ],
  })
  @IsArray()
  readonly steps: Step[];
}
