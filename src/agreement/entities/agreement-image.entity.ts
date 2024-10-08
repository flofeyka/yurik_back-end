import { UUID } from "crypto";
import { Image } from "src/images/image.entity";
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agreement } from "./agreement.entity";

@Entity({ name: 'agreement_images' })
export class AgreementImage {
    @PrimaryGeneratedColumn('uuid')
    id: UUID;

    @OneToOne(() => Image, { eager: true, onDelete: "CASCADE" })
    @JoinColumn()
    image: Image;

    @ManyToOne(() => Agreement, (agreement: Agreement) => agreement.images, { onDelete: "SET NULL" })
    @JoinColumn()
    agreement: Agreement;

}