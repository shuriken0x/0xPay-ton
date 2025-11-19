import { Address, TonClient } from "@ton/ton"

type Cursor = { lt: string; hash: string } | undefined

export class TONTransactionIterator {
  protected stack: Cursor[]
  public cursor: Cursor | undefined

  protected _canNext: boolean = true

  constructor(
    protected provider: TonClient,
    protected address: Address,
    protected limit: number,
  ) {
    this.stack = []
    this.cursor = undefined
  }

  async next() {
    if (!this.canNext()) {
      throw new Error("Cannot next")
    }

    const transactions = await this.provider.getTransactions(this.address, {
      limit: this.limit,
      archival: true,
      ...this.cursor,
    })

    this.stack.push(this.cursor)

    if (transactions.length < this.limit) {
      this._canNext = false
    } else {
      const lastTx = transactions[transactions.length - 1]
      if (lastTx) {
        this.cursor = { lt: lastTx.lt.toString(), hash: lastTx.hash().toString("base64") }
      } else {
        this._canNext = false
      }
    }

    return transactions
  }

  public canNext() {
    return this._canNext
  }

  public canBack() {
    return this.stack.length > 0
  }

  async back() {
    if (!this.canBack()) {
      throw new Error("Cannot back")
    }

    this.cursor = this.stack.pop()
    const transactions = await this.provider.getTransactions(this.address, {
      limit: this.limit,
      archival: true,
      ...this.cursor,
    })

    // this.stack.splice(this.stack.length - 1, 1)

    return transactions
  }
}
