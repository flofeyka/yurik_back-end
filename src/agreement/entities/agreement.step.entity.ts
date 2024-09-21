import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agreement } from "./agreement.entity";
import { AgreementMember } from "./agreement.member.entity";
import { Image } from "../../images/image.entity";

@Entity()
export class AgreementStep {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ManyToOne(() => Agreement)
    agreement: Agreement;

    @Column()
    title: string;

    @ManyToOne(() => Image)
    @JoinColumn()
    images: Image[];

    @ManyToOne(() => AgreementMember, (agreementMember: AgreementMember) => agreementMember.agreement, {nullable: true})
    user: AgreementMember;

    @Column({ type: "boolean"})
    isComplete: boolean;

    @Column({ nullable: true })
    comment: string | null;

    @Column({ type: "date" })
    start: Date;

    @Column({ type: "date" })
    end: Date;
}