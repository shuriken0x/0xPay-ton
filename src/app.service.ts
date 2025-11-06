import { HttpException, HttpStatus, INestApplication, Injectable } from "@nestjs/common"
import { color, colorize } from "json-colorizer"
import { isEmpty } from "lodash"
import { format, transports } from "winston"
import { Request, Response, NextFunction } from "express"
import { ZeroPayConfig } from "./config"

@Injectable()
export class AppService {
  public static async upgrade(app: INestApplication) {
    // @ts-ignore
    app.set("query parser", "extended")
    app.setGlobalPrefix("api")

    // @ts-ignore
    app.set("query parser", "extended")


    app.enableShutdownHooks()
  }

  public static getLoggerOptions() {
    return {
      level: "verbose",
      format: format.combine(
        serializeErrorsFormat(),
        format.timestamp({
          format: "DD.MM.YYYY HH:mm:ss.SSS",
        }),
        jsonColorFormat,
      ),
      transports: [new transports.Console()],
      levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        verbose: 5,
      },
      silent: false,
      exitOnError: false,
      handleRejections: true,
    }
  }
}

const serializeErrorsFormat = format((info) => {
  if (isEmpty(info.error)) {
    delete info.error
  }
  return info
})

const jsonColorFormat = format.printf(({ level, message, timestamp, context, data, ...meta }) => {
  const logObject = {
    timestamp,
    level,
    context,
    message,
    data,
    ...meta,
  }

  return colorize(logObject, {
    indent: 0,
    colors: {
      StringKey: color.magenta,
      StringLiteral: color.yellow,
      NumberLiteral: color.blue,
      NullLiteral: color.blue,
      BooleanLiteral: color.blue,
    } as any,
  })
})
