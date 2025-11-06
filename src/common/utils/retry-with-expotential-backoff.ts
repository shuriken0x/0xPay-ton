import retry from "retry"
import ms from "ms"


export function retryWithExponentialBackoff<F extends (...args: any[]) => Promise<any>>(
  func: F,
  retryIf: (e: unknown) => boolean,
  onRetry?: (attempt: number) => void | Promise<void>,
  options: Partial<retry.OperationOptions> = {}
) {
  return new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
    const operation = retry.operation({
      retries: 10,
      factor: 2,
      minTimeout: ms("100"),
      maxTimeout: ms("5s"),
      randomize: false,
      forever: false,
      maxRetryTime: ms("5m"),
      unref: false,
      ...options
    })

    operation.attempt(async (attempt) => {
      try {
        const data = await func()
        resolve(data)
      } catch (e: unknown) {
        if (retryIf(e)) {
          if (operation.retry(e as Error)) {
            if (typeof onRetry !== "undefined") {
              onRetry(attempt)
            }
            return
          }
        }
        reject(e as Error)
      }
    })
  })
}

