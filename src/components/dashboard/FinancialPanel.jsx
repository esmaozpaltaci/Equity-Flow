import React, { useState } from "react";
import { ArrowUpRight, Coins, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const FinancialPanel = () => {
  const { getSignerContracts, refreshAll, contributor, dividend } = useApp();
  const [toAddress, setToAddress]     = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [claiming, setClaiming]       = useState(false);

  const tokenBalance   = contributor.tokenBalance;
  const pendingRewards = dividend.pendingRewards;

  /* ── Token transfer ──────────────────────────────── */
  const handleTransfer = async () => {
    if (!/^0x[0-9a-fA-F]{40}$/.test(toAddress)) return toast.error("Geçersiz alıcı adresi.");
    const val = parseFloat(tokenAmount);
    if (!val || val <= 0) return toast.error("Geçerli bir token miktarı girin.");
    setTransferring(true);
    const toastId = toast.loading("Transfer gönderiliyor...");
    try {
      const { token } = await getSignerContracts();
      const tx = await token.transfer(toAddress, ethers.parseEther(tokenAmount));
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success(`${tokenAmount} EQT transfer edildi!`, { id: toastId });
      setToAddress("");
      setTokenAmount("");
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Transfer başarısız.", { id: toastId });
    } finally {
      setTransferring(false);
    }
  };

  /* ── Claim dividend ──────────────────────────────── */
  const handleClaim = async () => {
    if (!pendingRewards || pendingRewards === 0n) return toast.error("Çekilecek temettü yok.");
    setClaiming(true);
    const toastId = toast.loading("Temettü çekiliyor...");
    try {
      const { engine } = await getSignerContracts();
      const tx = await engine.claimDividend();
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("Temettü başarıyla çekildi! 🎉", { id: toastId });
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Temettü çekme başarısız.", { id: toastId });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dividend claim card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-emerald-400" />
          <h3 className="font-semibold text-[var(--text-primary)]">Birikmiş Temettü</h3>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Çekilebilir Miktar</p>
            <p className="text-2xl font-bold text-emerald-400">
              {pendingRewards !== undefined
                ? (Number(pendingRewards) / 1e18).toFixed(6)
                : "—"}{" "}
              <span className="text-sm text-[var(--text-muted)]">ETH</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)] mb-1">Toplam Dağıtılan</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {dividend?.totalDistributed !== undefined
                ? (Number(dividend.totalDistributed) / 1e18).toFixed(4)
                : "—"}{" "}
              ETH
            </p>
          </div>
        </div>
        <TxButton
          onClick={handleClaim}
          loading={claiming}
          icon={Gift}
          variant="success"
          className="w-full"
          disabled={!pendingRewards || pendingRewards === 0n}
        >
          Temettü Çek
        </TxButton>
      </div>

      {/* Token transfer card */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpRight size={16} className="text-brand-400" />
          <h3 className="font-semibold text-[var(--text-primary)]">Token Transferi</h3>
        </div>

        {/* Balance display */}
        <div className="flex items-center justify-between mb-4 px-3 py-2.5 rounded-xl bg-[var(--bg-primary)]">
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Coins size={12} />
            Mevcut Bakiye
          </span>
          <span className="text-sm font-bold text-brand-400">
            {tokenBalance !== undefined
              ? (Number(tokenBalance) / 1e18).toFixed(4)
              : "—"}{" "}
            EQT
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Alıcı Adresi
            </label>
            <input
              className="input"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              Miktar (EQT)
            </label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="number"
                min="0"
                step="0.0001"
                placeholder="0.0"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
              />
              <button
                onClick={() =>
                  tokenBalance && setTokenAmount((Number(tokenBalance) / 1e18).toFixed(4))
                }
                className="btn btn-secondary btn-sm whitespace-nowrap"
              >
                Tümü
              </button>
            </div>
          </div>
          <TxButton
            onClick={handleTransfer}
            loading={transferring}
            icon={ArrowUpRight}
            className="w-full"
          >
            Gönder
          </TxButton>
        </div>
      </div>
    </div>
  );
};

export default FinancialPanel;
