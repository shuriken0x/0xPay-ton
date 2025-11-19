import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Webhook {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @Column("varchar", {
    length: 255,
  })
  event: string

  @Column("jsonb")
  data: object

  @Column("boolean")
  sent: boolean

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
