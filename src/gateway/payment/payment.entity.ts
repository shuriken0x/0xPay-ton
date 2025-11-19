import { Column, CreateDateColumn, Entity, Generated, Index, PrimaryGeneratedColumn } from "typeorm"
import { Token } from "../consts/token"
import { ApiProperty } from "@nestjs/swagger"

@Entity()
export class Payment {
  @ApiProperty({ type: "string" })
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: string

  @ApiProperty({ type: "string", nullable: true })
  @Column("varchar", {
    length: 255,
    unique: true,
    nullable: true,
  })
  txid: string | null

  @ApiProperty({ type: "string", nullable: true })
  @Column("decimal", {
    precision: 78,
    scale: 0,
    nullable: true,
  })
  amount: string | null

  @ApiProperty({ enum: Token, nullable: true })
  @Column("enum", {
    enum: Token,
    nullable: true,
  })
  token: Token | null

  @ApiProperty({ type: "boolean" })
  @Column("boolean")
  paid: boolean

  @ApiProperty({ type: "string" })
  @Generated("increment")
  @Column("bigint", {
    unique: true,
  })
  memo: string

  @ApiProperty({ type: "string", nullable: true })
  @Index({
    unique: false,
    nullFiltered: true,
  })
  @Column("varchar", {
    length: 255,
    nullable: true,
  })
  payload: string | null

  @ApiProperty({ type: "string", format: "date-time" })
  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date
}
