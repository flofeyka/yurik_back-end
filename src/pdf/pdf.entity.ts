import { UUID } from "crypto";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'pdf-files'})
export class Pdf {
    @PrimaryGeneratedColumn('uuid')
    public id: UUID;

    @Column()
    public fileName: string;

    @ManyToOne(() => User)
    @JoinColumn()
    public user: User
}