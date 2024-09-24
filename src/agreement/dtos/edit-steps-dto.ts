import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export interface Step {
  id: number | undefined;
  title: string;
  userId: number;
  comment: string | null;
  start: Date;
  end: Date;
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
