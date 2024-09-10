import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export interface Member {
  id: number;
  status: "client" | "contractor";
}

export interface MemberEntity extends Member {
  code: number | undefined;
  inviteStatus: "Confirmed" | "Invited" | "Declined";
}

export interface MemberData extends Member {
  fullName: {
    firstName: string;
    lastName: string;
    middleName: string;
  },
  inviteStatus: "Confirmed" | "Invited" | "Declined";
  email: string;
  usersImage: string;
}

export interface Step {
  title: string;
  images: Array<string>;
  responsible: number;
  isComplete: boolean;
  comment: string | null;
  start: Date;
  end: Date;
}

@Entity()
export class Agreement {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column()
  public readonly title: string;

  @Column()
  public readonly text: string;

  @Column()
  public readonly initiator: number;

  @Column({ default: "In confirm process" })
  public readonly status: "At work" | "Declined" | "At a lawyer" | "In confirm process" ;

  @Column({ type: "float" })
  public readonly price: number;

  @Column("jsonb", { array: false, nullable: false, default: [] })
  public readonly members!: Array<MemberEntity>;

  @Column("jsonb", { array: false, default: [] })
  public readonly steps!: Array<Step>;

  @Column()
  public readonly start: Date;

  @Column()
  public readonly end: Date;
}