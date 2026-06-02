import React, { useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const DepositRevenue = () => {
  const { getSignerContracts, refreshAll, dividend } = useApp();
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return toast.error("Geçerli bir ETH miktarı girin.");
    setLoading(true);
    const toastId = toast.loading("İşlem gönderiliyor...");
    try {
      const { engine } = await getSignerContracts();
      const tx = await engine.depositRevenue({ value: ethers.parseEther(amount) });
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success(`${amount} ETH havuza yatırıldı!`, { id: toastId });
      setAmount("");
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "İşlem başarısız.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-emerald-500/15">
          <ArrowDownToLine size={18} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Gelir Yatır</h3>
          <p className="text-xs text-[var(--text-muted)]">
            ETH'yi temettü havuzuna ekler (token sahiplerine dağıtılır)
          </p>
        </div>
      </div>

      {/* Total distributed stat */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-primary)]">
        <span className="text-xs text-[var(--text-muted)]">Toplam Dağıtılan</span>
        <span className="text-sm font-bold text-emerald-400">
          {dividend?.totalDistributed !== undefined
            ? (Number(dividend.totalDistributed) / 1e18).toFixed(6)
            : "—"}{" "}
          ETH
        </span>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
          Yatırılacak ETH Miktarı
        </label>
        <div className="relative">
          <input
            className="input pr-14"
            type="number"
            min="0"
            step="0.001"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-dim)] font-mono">
            ETH
          </span>
        </div>
      </div>

      <TxButton
        onClick={handleDeposit}
        loading={loading}
        icon={ArrowDownToLine}
        variant="success"
        className="w-full"
      >
        Havuza Yatır
      </TxButton>
    </div>
  );
};

export default DepositRevenue;
