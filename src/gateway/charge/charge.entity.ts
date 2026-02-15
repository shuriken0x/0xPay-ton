import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm"
import { ChargeTransaction } from "./charge-transaction.entity"

@Entity()
export class Charge {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @Generated("increment")
  @Column("bigint", {
    unique: true,
  })
  memo: string

  @Index({
    unique: false,
    nullFiltered: true,
  })
  @Column("varchar", {
    length: 255,
    nullable: true,
  })
  payload: string | null

  @OneToMany(() => ChargeTransaction, (tx) => tx.charge)
  txs: Relation<ChargeTransaction>[]

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
