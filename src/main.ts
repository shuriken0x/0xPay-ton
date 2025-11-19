import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { AppService } from "./app.service"
import { WinstonModule } from "nest-winston"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { cleanupOpenApiDoc } from "nestjs-zod"
import { z } from "zod"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(AppService.getLoggerOptions()),
  })
  await AppService.upgrade(app)

  if (z.stringbool().parse(process.env.SWAGGER_ENABLED)) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("OxPay API")
        .setDescription("OxPay API description")
        .setVersion("1.0")
        .addSecurity("X-Access-Token", {
          type: "apiKey",
          in: "header",
          name: "X-Access-Token",
        })
        .addSecurityRequirements({ "X-Access-Token": [] })
        .build(),
      {
        deepScanRoutes: true,
        extraModels: [],
      },
    )

    SwaggerModule.setup("api/swagger", app, cleanupOpenApiDoc(document), {
      ui: true,
      raw: ["json", "yaml"],
    })
  }

  await app.listen(8000, "0.0.0.0")
}
void bootstrap()
