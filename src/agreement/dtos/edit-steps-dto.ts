import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsObject, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';
import { ImagesDto } from './images-dto';

class paymentStep {
  @IsNumber()
  price: number;
}

export class Step {
  @ApiProperty({
    title: "Заголовок шага", example: "Закупка материалов"
  })
  @IsString()
  title: string;

  @ApiProperty({
    title: "ID ответственного за шаг", example: 12
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    title: "Платежные данные", example: {
      price: 1234315
    }
  })
  @IsObject()
  payment: paymentStep

  @ApiProperty({
    title: "Комментарий к шагу", example: "Заказчик обязуется..."
  })
  @IsString()
  comment: string | null;

  @ApiProperty({
    title: "Фотографии шага", example: ImagesDto
  })
  @IsArray()
  images: string[];

  @ApiProperty({
    title: "Дата начала выполнения шага", example: '12-12-2023'
  })
  @IsDateString()
  start: Date;

  @ApiProperty({
    title: "Дата начала выполнения шага", example: '12-12-2023'
  })
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
