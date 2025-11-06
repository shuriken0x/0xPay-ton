import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { NestExpressApplication } from "@nestjs/platform-express"
import { AppService } from "./app.service"
import { WinstonModule } from "nest-winston"
import { DataSource } from "typeorm"
import { DatabaseConfig } from "./config"
import { Payment } from "./gateway/payment/payment.entity"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(AppService.getLoggerOptions())
  })

  await AppService.upgrade(app)
  await app.listen(8000, "0.0.0.0")
}
void bootstrap()
