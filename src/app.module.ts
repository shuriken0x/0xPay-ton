import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common"
import { AppService } from "./app.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DatabaseConfig } from "./config"
import { DataSource, DataSourceOptions } from "typeorm"
import { WinstonModule } from "nest-winston"
import { GatewayModule } from "./gateway/gateway.module"
import { AppMiddleware } from "./app.middleware"

@Module({
  imports: [
    WinstonModule.forRoot({
      ...AppService.getLoggerOptions(),
    }),
    TypeOrmModule.forRootAsync({
      name: "default",
      inject: [],
      useFactory: async () => {
        return {
          ...DatabaseConfig,
          autoLoadEntities: true,
        }
      },
      dataSourceFactory: async (options) => {
        return new DataSource(options as DataSourceOptions)
      },
    }),
    GatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes("*path")
  }
}
