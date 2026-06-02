import React, { useState } from "react";
import { Settings } from "lucide-react";
import toast from "react-hot-toast";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const MULTIPLIER_OPTIONS = [
  { value: 1,  label: "1 — 0.1× (En az)" },
  { value: 2,  label: "2 — 0.2×" },
  { value: 3,  label: "3 — 0.3×" },
  { value: 4,  label: "4 — 0.4×" },
  { value: 5,  label: "5 — 0.5× (Orta)" },
  { value: 6,  label: "6 — 0.6×" },
  { value: 7,  label: "7 — 0.7×" },
  { value: 8,  label: "8 — 0.8×" },
  { value: 9,  label: "9 — 0.9×" },
  { value: 10, label: "10 — 1.0× (En fazla)" },
];

const SetRoleMultiplier = () => {
  const { getSignerContracts } = useApp();
  const [role, setRole]           = useState("");
  const [multiplier, setMultiplier] = useState(10);
  const [loading, setLoading]     = useState(false);

  const handleSet = async () => {
    if (!role.trim()) return toast.error("Rol adı girin.");
    setLoading(true);
    const toastId = toast.loading("İşlem gönderiliyor...");
    try {
      const { engine } = await getSignerContracts();
      const tx = await engine.setRoleMultiplier(role.trim(), multiplier);
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success(`"${role}" rolü için çarpan ${multiplier} olarak ayarlandı.`, { id: toastId });
      setRole("");
      setMultiplier(10);
    } catch (e) {
      toast.error(e?.reason || e?.message || "İşlem başarısız.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-purple-500/15">
          <Settings size={18} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Rol Çarpanı Tanımla</h3>
          <p className="text-xs text-[var(--text-muted)]">
            1 = 0.1× · 10 = 1.0× (token kazanım katsayısı)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Rol Adı
          </label>
          <input
            className="input"
            placeholder="ör: Yazılımcı, Tasarımcı..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Çarpan — seçili: <span className="text-brand-400 font-bold">{multiplier}</span>
            <span className="text-[var(--text-dim)]"> ({(multiplier / 10).toFixed(1)}×)</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-dim)] mt-1">
            <span>0.1×</span>
            <span>0.5×</span>
            <span>1.0×</span>
          </div>
        </div>

        {/* Preview grid */}
        <div className="grid grid-cols-5 gap-1 mt-1">
          {MULTIPLIER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMultiplier(opt.value)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                multiplier === opt.value
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border)] hover:border-brand-500/50"
              }`}
            >
              {opt.value}
            </button>
          ))}
        </div>
      </div>

      <TxButton
        onClick={handleSet}
        loading={loading}
        icon={Settings}
        className="w-full"
      >
        Çarpanı Kaydet
      </TxButton>
    </div>
  );
};

export default SetRoleMultiplier;
