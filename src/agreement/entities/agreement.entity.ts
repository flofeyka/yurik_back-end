import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Agreement {
  @PrimaryColumn()
  readonly id: number;

  @Column()
  readonly title: string;

  @Column()
  readonly text: string;

  @Column()
  readonly initiator: "client" | "contractor";

  @Column()
  readonly status: "At work" | "Declined" | "At a lawyer";

  @Column({type: "float"})
  readonly price: number;

  @Column("json", { array: true, nullable: false, default: [] })
  readonly members: Array<{
    id: number;
    status: "client" | "contractor";
    isConfirmed: boolean;
  }>

  @Column("json", {array: true, default: []})
  readonly steps: Array<{
    title: string;
    images: Array<string>,
    responsible: number;
    isComplete: boolean,
    comment: string | null,
    start: Date,
    end: Date
  }>

  @Column()
  readonly start: Date;

  @Column()
  readonly end: Date;
}