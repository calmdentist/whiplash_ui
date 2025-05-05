import {
    TransactionInstruction,
    PublicKey,
    AddressLookupTableAccount,
    VersionedTransaction,
    TransactionMessage,
    ComputeBudgetProgram,
    Transaction,
    RpcResponseAndContext,
    SignatureResult,
    SimulatedTransactionResponse,
  } from "@solana/web3.js";
  import { connection } from './connection';
  
  export const getErrorFromRPCResponse = (
    rpcResponse: RpcResponseAndContext<
      SignatureResult | SimulatedTransactionResponse
    >,
  ) => {
    // Note: `confirmTransaction` does not throw an error if the confirmation does not succeed,
    // but rather a `TransactionError` object. so we handle that here
    // See https://solana-labs.github.io/solana-web3.js/v1.x/classes/Connection.html#confirmTransaction.confirmTransaction-1
  
    const error = rpcResponse.value.err;
    if (error) {
      // Can be a string or an object (literally just {}, no further typing is provided by the library)
      // https://github.com/solana-labs/solana-web3.js/blob/4436ba5189548fc3444a9f6efb51098272926945/packages/library-legacy/src/connection.ts#L2930
      // TODO: if still occurs in web3.js 2 (unlikely), fix it.
      if (typeof error === "object") {
        const errorKeys = Object.keys(error);
        if (errorKeys.length === 1) {
          if (errorKeys[0] !== "InstructionError") {
            throw new Error(`Unknown RPC error: ${error}`);
          }
          // @ts-ignore due to missing typing information mentioned above.
          const instructionError = error["InstructionError"];
          // An instruction error is a custom program error and looks like:
          // [
          //   1,
          //   {
          //     "Custom": 1
          //   }
          // ]
          // See also https://solana.stackexchange.com/a/931/294
          throw new Error(
            `Error in transaction: instruction index ${instructionError[0]}, custom program error ${instructionError[1]["Custom"]}`,
          );
        }
      }
      throw Error(error.toString());
    }
  };
  
  export async function getOptimalComputeUnitsForTransactions(
    txns: Array<Transaction>,
    sender: PublicKey,
    lookupTables: Array<AddressLookupTableAccount>,
    buffer: number = 0.2,
  ): Promise<Array<number | null>> {
    const cus = await Promise.all(
      txns.map((tx) =>
        getOptimalComputeUnits(
          tx.instructions,
          sender,
          lookupTables,
          buffer,
        ),
      ),
    );
    return cus;
  }
  
  export const getOptimalComputeUnits = async (
    instructions: Array<TransactionInstruction>,
    payer: PublicKey,
    lookupTables: Array<AddressLookupTableAccount> | [],
    buffer: number = 0.2,
  ): Promise<number | null> => {
    const testInstructions = [
      // Set an arbitrarily high number in simulation
      // so we can be sure the transaction will succeed
      // and get the real compute units used
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
      ...instructions,
    ];
  
    const testTransaction = new VersionedTransaction(
      new TransactionMessage({
        instructions: testInstructions,
        payerKey: payer,
        // RecentBlockhash can by any public key during simulation
        // since 'replaceRecentBlockhash' is set to 'true' below
        recentBlockhash: PublicKey.default.toString(),
      }).compileToV0Message(lookupTables),
    );
  
    const rpcResponse = await connection.simulateTransaction(testTransaction, {
      replaceRecentBlockhash: true,
      sigVerify: false,
    });
  
    getErrorFromRPCResponse(rpcResponse);
    let units = rpcResponse.value.unitsConsumed || null;
    if (units) {
      units = Math.floor(units * (1 + buffer));
    }
    return units;
  };
  
  