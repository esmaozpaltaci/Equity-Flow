// ─────────────────────────────────────────────────────────────────────────────
//  Contract Addresses — Ethereum Sepolia Testnet
//  Update MAIN_ENGINE_ADDRESS after deploying the new MainEngine.sol
// ─────────────────────────────────────────────────────────────────────────────

export const NETWORK = {
  chainId: "0xaa36a7", // 11155111 decimal
  chainName: "Sepolia Test Network",
  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

export const CONTRIBUTOR_NFT_ADDRESS = "0x88685937552a455C229cfdbcEF0EaFa6B2F68529";
export const EQUITY_TOKEN_ADDRESS    = "0x1d3bc3E6EB695F09FCe714799BE8Af250E0e1Ff3";

// ✅ Deployed MainEngine — 2026-05-31
export const MAIN_ENGINE_ADDRESS = "0x8f646a952A9e72A318E957c1e3dBE046E85BcB0B";

// ✅ Deployed GovernanceVoting — 2026-06-01
export const GOVERNANCE_VOTING_ADDRESS = "0x8aB58f93147B6d88C84cc09e36d6aD31CF6C7FE2";
