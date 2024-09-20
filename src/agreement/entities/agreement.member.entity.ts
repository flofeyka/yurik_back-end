import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agreement } from "./agreement.entity";
import { AgreementStep } from "./agreement.step.entity";

@Entity({name: 'members'})
export class AgreementMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Agreement, (agreement) => agreement.members)
    agreement: Agreement;

    @Column()
    status: "client" | "contractor" | "lawyer";

    @Column()
    inviteStatus: "Confirmed" | "Invited" | "Declined";
}