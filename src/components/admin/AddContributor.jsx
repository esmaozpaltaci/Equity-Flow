import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const MULTIPLIERS = [1,2,3,4,5,6,7,8,9,10];

const AddContributor = () => {
  const { getSignerContracts, refreshAll } = useApp();
  const [address, setAddress]       = useState("");
  const [role, setRole]             = useState("");
  const [multiplier, setMultiplier] = useState(10);
  const [loading, setLoading]       = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!address || !role.trim()) return toast.error("Adres ve unvan alanları boş bırakılamaz.");
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return toast.error("Geçersiz Ethereum adresi.");

    setLoading(true);
    const toastId = toast.loading("Paydaş ekleniyor...");
    try {
      const { engine } = await getSignerContracts();

      // 1. Paydaş ekle + NFT mint
      const tx1 = await engine.addContributor(address, role.trim());
      toast.loading("NFT mint işlemi bekleniyor...", { id: toastId });
      await tx1.wait();

      // 2. Rol çarpanını kaydet
      const tx2 = await engine.setRoleMultiplier(role.trim(), multiplier);
      toast.loading("Rol çarpanı kaydediliyor...", { id: toastId });
      await tx2.wait();

      toast.success(`✅ ${role} rolüyle paydaş eklendi! Çarpan: ${multiplier}/10`, { id: toastId });
      setAddress("");
      setRole("");
      setMultiplier(10);
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "İşlem başarısız.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-brand-500/15">
          <UserPlus size={18} className="text-brand-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Paydaş Ekle</h3>
          <p className="text-xs text-[var(--text-muted)]">NFT mint + rol çarpanı tek seferde kaydedilir</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="space-y-4">
        {/* Wallet address */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Cüzdan Adresi
          </label>
          <input
            className="input"
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Role name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Unvan / Rol
          </label>
          <input
            className="input"
            placeholder="ör: Yazılımcı, Tasarımcı, Pazarlama..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* Multiplier */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
            Saat Başı Token Çarpanı —{" "}
            <span className="text-brand-400 font-bold">
              {multiplier}/10 = {(multiplier / 10).toFixed(1)}× çarpan
            </span>
          </label>

          {/* Slider */}
          <input
            type="range"
            min={1} max={10}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer mb-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-dim)] mb-3">
            <span>0.1×</span><span>0.5×</span><span>1.0×</span>
          </div>

          {/* Quick-select grid */}
          <div className="grid grid-cols-10 gap-1">
            {MULTIPLIERS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMultiplier(m)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  multiplier === m
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border)] hover:border-brand-500/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {role && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-[var(--text-muted)]">
            <span>🎯 Onaylanan her saat için:</span>
            <span className="font-bold text-brand-400">
              {(multiplier * 0.1).toFixed(1)} EQT token
            </span>
            <span>kazanılacak</span>
          </div>
        )}

        <TxButton
          type="submit"
          loading={loading}
          icon={UserPlus}
          className="w-full"
        >
          NFT Mint Et &amp; Paydaş Ekle
        </TxButton>
      </form>
    </div>
  );
};

export default AddContributor;
