import { RPC_ENDPOINT } from "./connection";

export async function getPriorityFeeEstimate(serializedTx: string, priorityLevel: string = "High") {
  const response = await fetch(RPC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          transaction: serializedTx, // Pass the serialized transaction in Base58
          options: { priorityLevel: priorityLevel },
        },
      ],
    }),
  });
  const data = await response.json() as {result: {priorityFeeEstimate: number}};
  
  return data.result.priorityFeeEstimate;
}

export async function getPriorityFeeEstimateByAccounts(accounts: string[], priorityLevel: string = "High") {
  const response = await fetch(RPC_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          accountKeys: accounts,
          options: { priorityLevel: priorityLevel },
        },
      ],
    }),
  });
  const data = await response.json() as {result: {priorityFeeEstimate: number}};
  
  return data.result.priorityFeeEstimate;
}