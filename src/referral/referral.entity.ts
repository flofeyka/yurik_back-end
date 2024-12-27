import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UUID } from "crypto";
import { User } from "../user/entities/user.entity";

@Entity('refs')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  public id: UUID;

  @ManyToOne((): typeof User => User, {eager: true, onDelete: "CASCADE"})
  public user: User;

  @OneToMany((): typeof User => User, (user: User): Referral => user.referral)
  public users: User[];
}