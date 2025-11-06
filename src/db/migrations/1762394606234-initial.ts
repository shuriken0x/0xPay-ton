import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1762394606234 implements MigrationInterface {
    name = 'Initial1762394606234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_token_enum" AS ENUM('TON', 'USDT')`);
        await queryRunner.query(`CREATE TABLE "payment" ("id" BIGSERIAL NOT NULL, "txid" character varying(255), "amount" numeric(78,0), "token" "public"."payment_token_enum", "paid" boolean NOT NULL, "memo" BIGSERIAL NOT NULL, "payload" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6cfd1092a077d767a34a96588a3" UNIQUE ("txid"), CONSTRAINT "UQ_8090faf9e00030a209292e5987e" UNIQUE ("memo"), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c533955e5f3d2fea401cd08630" ON "payment" ("payload") `);
        await queryRunner.query(`CREATE TABLE "processed_transaction" ("id" BIGSERIAL NOT NULL, "txid" character varying(255), "note" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f25f9f57ef76b2803d1a4ac4791" UNIQUE ("txid"), CONSTRAINT "PK_60ad9419acf77b8d993d31184f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "webhook" ("id" BIGSERIAL NOT NULL, "event" character varying(255) NOT NULL, "data" jsonb NOT NULL, "sent" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "webhook"`);
        await queryRunner.query(`DROP TABLE "processed_transaction"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c533955e5f3d2fea401cd08630"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_token_enum"`);
    }

}
