import { User } from "src/user/user.entity";
import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Agreement } from "./agreement.entity";

@Entity({name: "lawyers"}) 
export class Lawyer {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @OneToMany(() => Agreement, (agreement: Agreement) => agreement.lawyer)
    agreements: Agreement[];
}