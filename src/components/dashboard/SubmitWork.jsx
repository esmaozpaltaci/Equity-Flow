import React, { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const SubmitWork = () => {
  const { getSignerContracts, refreshAll } = useApp();
  const [hours, setHours]           = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const h = parseInt(hours);
    if (!h || h <= 0 || h > 720) return toast.error("Saat 1-720 arasında olmalıdır.");
    if (!description.trim()) return toast.error("Açıklama boş bırakılamaz.");
    setLoading(true);
    const toastId = toast.loading("İş kaydı gönderiliyor...");
    try {
      const { engine } = await getSignerContracts();
      const tx = await engine.submitWork(BigInt(h), description.trim());
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("İş kaydedildi! Diğer paydaşlar onaylayabilir.", { id: toastId });
      setHours("");
      setDescription("");
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "İşlem başarısız.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Send size={16} className="text-brand-400" />
        Yeni İş Bildir
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Çalışma Saati
          </label>
          <input
            className="input"
            type="number"
            min="1"
            max="720"
            placeholder="ör: 8"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Ne Yaptınız?
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Yaptığınız işi kısaca açıklayın..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <TxButton
          type="submit"
          loading={loading}
          icon={Send}
          className="w-full"
        >
          İş Bildir
        </TxButton>
      </form>
    </div>
  );
};

export default SubmitWork;
