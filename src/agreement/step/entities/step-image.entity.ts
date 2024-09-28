import { UUID } from "crypto";
import { Image } from "src/images/image.entity";
import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AgreementStep } from "./step.entity";

@Entity({name: "step_images"})
export class StepImage {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @OneToOne(() => Image, {onDelete: "CASCADE"})
    @JoinColumn()
    image: Image;

    @ManyToOne(() => AgreementStep, (step: AgreementStep) => step.images, {onDelete: "SET NULL"})
    @JoinColumn()
    step: AgreementStep;
}