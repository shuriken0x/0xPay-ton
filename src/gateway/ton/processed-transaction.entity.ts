import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class ProcessedTransaction {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @Column("varchar", {
    length: 255,
    nullable: true,
    unique: true,
  })
  txid: string | null

  @Column("text", {
    nullable: true
  })
  note: string | null

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
