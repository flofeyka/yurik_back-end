import { Column, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("sms")
export class Sms {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar')
    smsUniqueIds: number[];

    @Column({unique: true})
    phoneNumber: string;

    @Column()
    code: number;

    @Column({default: false})
    used: boolean;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updatedAt: Date;
}