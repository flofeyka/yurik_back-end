import { UUID } from 'crypto';
import { Image } from 'src/images/image.entity';
import {
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AgreementStep } from './step.entity';

@Entity({ name: 'step_images' })
export class StepImage {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @OneToOne((): typeof Image => Image, { onDelete: 'CASCADE' })
  @JoinColumn()
  image: Image;

  @ManyToOne(
    (): typeof AgreementStep => AgreementStep,
    (step: AgreementStep): StepImage[] => step.images,
    { onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn()
  step: AgreementStep;
}
