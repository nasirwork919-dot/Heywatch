export const cryptoPaymentOptions = [
  {
    id: "usdc-sol",
    asset: "USDC",
    name: "USD Coin",
    network: "Solana",
    networkCode: "SOL",
    address: "AnTzrXQUaW6eEBXBbotKL29GWzmbsy6eAV1s1XgF8nTH",
    accent: "#2775ca",
    transactionPattern: /^[1-9A-HJ-NP-Za-km-z]{80,90}$/,
    transactionHint: "Paste the Solana transaction signature.",
  },
  {
    id: "eth-erc20",
    asset: "ETH",
    name: "Ethereum",
    network: "Ethereum (ERC-20)",
    networkCode: "ERC-20",
    address: "0x6ef27c8c7b9a5d2567d698b6d884f0e8342d021c",
    accent: "#627eea",
    transactionPattern: /^0x[a-fA-F0-9]{64}$/,
    transactionHint: "Paste the Ethereum transaction hash beginning with 0x.",
  },
  {
    id: "btc-bitcoin",
    asset: "BTC",
    name: "Bitcoin",
    network: "Bitcoin",
    networkCode: "BTC",
    address: "1DUL1vC5LDKuxTRMteGseRBcqfzxREssHv",
    accent: "#f7931a",
    transactionPattern: /^[a-fA-F0-9]{64}$/,
    transactionHint: "Paste the 64-character Bitcoin transaction ID.",
  },
  {
    id: "bnb-bep20",
    asset: "BNB",
    name: "BNB",
    network: "BNB Smart Chain (BEP-20)",
    networkCode: "BEP-20",
    address: "0x6ef27c8c7b9a5d2567d698b6d884f0e8342d021c",
    accent: "#f3ba2f",
    transactionPattern: /^0x[a-fA-F0-9]{64}$/,
    transactionHint: "Paste the BNB Smart Chain transaction hash beginning with 0x.",
  },
] as const;

export type CryptoPaymentId = (typeof cryptoPaymentOptions)[number]["id"];

export function getCryptoPaymentOption(id: string) {
  return cryptoPaymentOptions.find((option) => option.id === id);
}

export function isValidTransactionHash(paymentId: string, transactionHash: string): boolean {
  const option = getCryptoPaymentOption(paymentId);
  return Boolean(option?.transactionPattern.test(transactionHash.trim()));
}
