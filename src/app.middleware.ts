import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"
import { ZeroPayConfig } from "./config"

@Injectable()
export class AppMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const expectedSecret = ZeroPayConfig.apiSecret
    const providedSecret = req.header("x-access-token")

    if (providedSecret === expectedSecret) {
      next()
      return
    }

    next(
      new HttpException(
        {
          message: "X-Access-Token header contains invalid token or not exists",
        },
        HttpStatus.UNAUTHORIZED,
      ),
    )
  }
}
