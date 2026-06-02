import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { NETWORK, CONTRIBUTOR_NFT_ADDRESS, MAIN_ENGINE_ADDRESS } from "../contracts/addresses";
import ContributorNFT_ABI from "../contracts/ContributorNFT.json";
import MainEngine_ABI from "../contracts/MainEngine.json";

export const useWallet = () => {
  const [account, setAccount]                   = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting]         = useState(false);
  const [error, setError]                       = useState(null);
  const connectingRef = useRef(false);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setIsCorrectNetwork(chainId === NETWORK.chainId);
    } catch {
      setIsCorrectNetwork(false);
    }
  }, []);

  // ── Bağlan: MetaMask'ta seçili hesabı bağla ──
  const connect = useCallback(async () => {
    if (!window.ethereum) { setError("MetaMask bulunamadı."); return; }
    if (connectingRef.current) return;
    connectingRef.current = true;
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    } catch (e) {
      if (e.code === 4001)       setError("Bağlantı reddedildi.");
      else if (e.code === -32002) setError("MetaMask'ta bekleyen bir istek var, lütfen MetaMask'ı açıp işlemi tamamlayın.");
      else                       setError(e.message || "Bağlantı hatası.");
    } finally {
      setIsConnecting(false);
      connectingRef.current = false;
    }
  }, [checkNetwork]);

  // ── Hesap Değiştir: MetaMask hesap seçiciyi zorla aç ──
  const switchAccountReal = useCallback(async () => {
    if (!window.ethereum) { setError("MetaMask bulunamadı."); return "error"; }
    if (connectingRef.current) return "pending";
    connectingRef.current = true;
    setIsConnecting(true);
    setError(null);
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
      return "ok";
    } catch (e) {
      if (e.code === 4001) {
        setError("Hesap seçimi reddedildi.");
      } else if (e.code === -32002) {
        setError("MetaMask'ta bekleyen bir istek var. Lütfen tarayıcı uzantısından MetaMask'ı açıp işlemi onaylayın/reddedin.");
        return "pending";
      } else {
        setError(e.message || "Bir hata oluştu.");
      }
      return "error";
    } finally {
      setIsConnecting(false);
      connectingRef.current = false;
    }
  }, [checkNetwork]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK],
          });
        } catch {}
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setError(null);
    connectingRef.current = false;
  }, []);

  // Sayfa yüklendiğinde bağlıysa sessizce al
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkNetwork();
        }
      } catch {}
    };
    init();
  }, [checkNetwork]);

  // MetaMask değişikliklerini dinle
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (accounts.length > 0) { setAccount(accounts[0]); setError(null); }
      else setAccount(null);
    };
    const onChainChanged = () => checkNetwork();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged",    onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged",    onChainChanged);
    };
  }, [checkNetwork]);

  return {
    account, isCorrectNetwork, isConnecting, error,
    connect, disconnect, switchNetwork, switchAccountReal,
  };
};
