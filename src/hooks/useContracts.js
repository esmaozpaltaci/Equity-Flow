import { useMemo } from "react";
import { ethers } from "ethers";
import ContributorNFT_ABI from "../contracts/ContributorNFT.json";
import EquityToken_ABI    from "../contracts/EquityToken.json";
import MainEngine_ABI     from "../contracts/MainEngine.json";
import {
  CONTRIBUTOR_NFT_ADDRESS,
  EQUITY_TOKEN_ADDRESS,
  MAIN_ENGINE_ADDRESS,
} from "../contracts/addresses";

export const useContracts = (account) => {
  // ── Read provider: MetaMask'ın kendi provider'ını kullan (Kaspersky sorunundan kaçınır)
  // Eğer MetaMask yoksa fallback olarak public RPC kullan
  const readProvider = useMemo(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback: public RPC (MetaMask yokken)
    return new ethers.JsonRpcProvider(
      "https://ethereum-sepolia-rpc.publicnode.com"
    );
  }, []);

  // ── Read contracts (MetaMask provider üzerinden)
  const readContracts = useMemo(() => ({
    nft:    new ethers.Contract(CONTRIBUTOR_NFT_ADDRESS, ContributorNFT_ABI, readProvider),
    token:  new ethers.Contract(EQUITY_TOKEN_ADDRESS,    EquityToken_ABI,    readProvider),
    engine: new ethers.Contract(MAIN_ENGINE_ADDRESS,     MainEngine_ABI,     readProvider),
  }), [readProvider]);

  // ── Signer contracts (işlem gönderirken)
  const getSignerContracts = async () => {
    if (!window.ethereum) throw new Error("MetaMask bulunamadı");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    return {
      nft:    new ethers.Contract(CONTRIBUTOR_NFT_ADDRESS, ContributorNFT_ABI, signer),
      token:  new ethers.Contract(EQUITY_TOKEN_ADDRESS,    EquityToken_ABI,    signer),
      engine: new ethers.Contract(MAIN_ENGINE_ADDRESS,     MainEngine_ABI,     signer),
    };
  };

  return { readContracts, getSignerContracts };
};
