import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm"
import { Token } from "../consts/token"
import { Charge } from "./charge.entity"

@Entity()
export class ChargeTransaction {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @Column("varchar", {
    length: 255,
    unique: true,
  })
  txid: string

  @Column("decimal", {
    precision: 78,
    scale: 0,
  })
  amount: string

  @Column("enum", {
    enum: Token,
  })
  token: Token

  @ManyToOne(() => Charge, (charge) => charge.txs)
  charge: Relation<Charge>

  @Column("bigint")
  chargeId: string

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
