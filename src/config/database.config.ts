import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import process from "process"
import { LoggerOptions } from "typeorm"
import { MixedList } from "typeorm/common/MixedList"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import { z } from "zod"
import { ConfigService } from "./config.service"
import { Charge } from "../gateway/charge/charge.entity"
import { ProcessedTransaction } from "../gateway/ton/processed-transaction.entity"
import { Webhook } from "../gateway/webhook/webhook.entity"
import { ChargeTransaction } from "../gateway/charge/charge-transaction.entity"
import { Initial1771139259564 } from "../db/migrations/1771139259564-initial"

const schema = z.object({
  host: z.string(),
  port: z.coerce.number().int(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
})

export default function () {
  const logLevels: LoggerOptions = [
    "log",
    "warn",
    "error",
    "migration",
    // "schema"
    // "query"
  ]

  const connectionConfig = schema.parse({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  })

  const baseConfig = {
    type: "postgres",
    ...connectionConfig,
  } as PostgresConnectionOptions

  const sharedOptions = {
    schema: "public",
    logging: logLevels,
    entities: [Charge, ChargeTransaction, ProcessedTransaction, Webhook] as MixedList<Function>,
    migrations: [Initial1771139259564] as MixedList<Function>,
    migrationsTableName: "migrations",
    installExtensions: true,
    extra: 16,
    autoLoadEntities: false,
  } as PostgresConnectionOptions & Pick<TypeOrmModuleOptions, "autoLoadEntities">

  let dataSourceOptions: PostgresConnectionOptions

  if (ConfigService.isDevelopment() || ConfigService.isTest()) {
    dataSourceOptions = {
      ...baseConfig,
      ...sharedOptions,
      dropSchema: true,
      synchronize: true,
      migrationsRun: false,
    }
  } else if (ConfigService.isProduction()) {
    dataSourceOptions = {
      ...baseConfig,
      ...sharedOptions,
      migrationsRun: true,
      synchronize: false,
      dropSchema: false,
    }
  } else {
    throw new Error(`Provided NODE_ENV(${process.env.NODE_ENV}) is invalid`)
  }
  return dataSourceOptions as PostgresConnectionOptions
}
