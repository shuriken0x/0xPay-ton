import { Injectable } from "@nestjs/common"
import {
  Address,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  StateInit,
  toNano,
  TupleBuilder,
} from "@ton/core"
import { Blockchain, createShardAccount, type SandboxContract } from "@ton/sandbox"

@Injectable()
export class JettonService {
  protected constructor(protected masterAddress: Address, protected contract: SandboxContract<JettonContract>) {}

  public static async initialize(jettonContractCode: string, jettonContractData: string, jettonMasterAddress: string) {
    const blockchain = await Blockchain.create()
    const contractCode = Cell.fromHex(jettonContractCode)
    const contractData = Cell.fromHex(jettonContractData)
    const masterAddress = Address.parse(jettonMasterAddress)
    const openedContract = blockchain.openContract(new JettonContract(masterAddress))
    await blockchain.setShardAccount(
      masterAddress,
      createShardAccount({
        address: masterAddress,
        code: contractCode,
        data: contractData,
        balance: toNano("1"),
        workchain: 0,
      })
    )
    return new JettonService(masterAddress, openedContract)
  }

  public getJettonMaster() {
    return this.masterAddress
  }

  public async getJettonWallet(holder: string) {
    const stack = new TupleBuilder()
    stack.writeAddress(Address.parse(holder))
    const result = await this.contract.getRunMethod("get_wallet_address", stack)
    return result.readAddress()
  }
}

class JettonContract implements Contract {
  readonly address: Address
  readonly init?: StateInit

  static fromInit(code: Cell, data: Cell) {
    return new JettonContract(contractAddress(0, { code: code, data: data }), { code: code, data: data })
  }

  constructor(address: Address, init?: StateInit) {
    this.address = address
    this.init = init
  }

  async send(
    provider: ContractProvider,
    via: Sender,
    args: { value: bigint; bounce?: boolean | null | undefined },
    body: Cell
  ) {
    await provider.internal(via, { ...args, body: body })
  }

  async getRunMethod(provider: ContractProvider, id: number | string, stack: TupleBuilder = new TupleBuilder()) {
    return (await provider.get(id, stack.build())).stack
  }
}
