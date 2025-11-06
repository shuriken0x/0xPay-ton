import { Column, CreateDateColumn, Entity, Generated, Index, PrimaryGeneratedColumn } from "typeorm"
import { Token } from "../token.enum"

@Entity()
export class Payment {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @Column("varchar", {
    length: 255,
    unique: true,
    nullable: true,
  })
  txid: string | null

  @Column("decimal", {
    precision: 78,
    scale: 0,
    nullable: true,
  })
  amount: string | null

  @Column("enum", {
    enum: Token,
    nullable: true,
  })
  token: Token | null

  @Column("boolean")
  paid: boolean

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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
