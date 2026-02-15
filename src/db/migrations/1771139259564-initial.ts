import { MigrationInterface, QueryRunner } from "typeorm"

export class Initial1771139259564 implements MigrationInterface {
  name = "Initial1771139259564"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."charge_transaction_token_enum" AS ENUM('TON', 'USDT', 'NOT')`)
    await queryRunner.query(
      `CREATE TABLE "charge_transaction" ("id" BIGSERIAL NOT NULL, "txid" character varying(255) NOT NULL, "amount" numeric(78,0) NOT NULL, "token" "public"."charge_transaction_token_enum" NOT NULL, "chargeId" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e082a135a503bc2e58f4171bdc8" UNIQUE ("txid"), CONSTRAINT "PK_27c9c1ae38e3f18c4e5be34e2a6" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "charge" ("id" BIGSERIAL NOT NULL, "memo" BIGSERIAL NOT NULL, "payload" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c395426ee7dd5c1b55519c8bc97" UNIQUE ("memo"), CONSTRAINT "PK_ac0381acde3bdffe41ad57cd942" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`CREATE INDEX "IDX_4651e4bb1dc72fe25565853bca" ON "charge" ("payload") `)
    await queryRunner.query(
      `CREATE TABLE "processed_transaction" ("id" BIGSERIAL NOT NULL, "txid" character varying(255), "note" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f25f9f57ef76b2803d1a4ac4791" UNIQUE ("txid"), CONSTRAINT "PK_60ad9419acf77b8d993d31184f0" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "webhook" ("id" BIGSERIAL NOT NULL, "event" character varying(255) NOT NULL, "data" jsonb NOT NULL, "sent" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "charge_transaction" ADD CONSTRAINT "FK_d5b76d0961ddd49f0363bb005df" FOREIGN KEY ("chargeId") REFERENCES "charge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "charge_transaction" DROP CONSTRAINT "FK_d5b76d0961ddd49f0363bb005df"`)
    await queryRunner.query(`DROP TABLE "webhook"`)
    await queryRunner.query(`DROP TABLE "processed_transaction"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4651e4bb1dc72fe25565853bca"`)
    await queryRunner.query(`DROP TABLE "charge"`)
    await queryRunner.query(`DROP TABLE "charge_transaction"`)
    await queryRunner.query(`DROP TYPE "public"."charge_transaction_token_enum"`)
  }
}
