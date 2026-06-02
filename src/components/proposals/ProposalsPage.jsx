import React, { useState } from "react";
import { Megaphone, RefreshCw, AlertTriangle, Vote } from "lucide-react";
import toast from "react-hot-toast";
import { getSignerContract, isGovernanceDeployed } from "../../hooks/useProposals";
import { GOVERNANCE_VOTING_ADDRESS } from "../../contracts/addresses";
import TxButton from "../ui/TxButton";
import ProposalCard from "./ProposalCard";
import { SkeletonWorkItem } from "../ui/SkeletonCard";
import { useApp } from "../../context/AppContext";

const ProposalsPage = () => {
  const { proposals: { proposals, loading, refresh }, wallet } = useApp();
  const [description, setDescription] = useState("");
  const [creating, setCreating]       = useState(false);
  const [voting, setVoting]           = useState(null);
  const [finalizing, setFinalizing]   = useState(null);
  const [filter, setFilter]           = useState("active");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Öneri açıklaması girin.");
    setCreating(true);
    const toastId = toast.loading("Öneri gönderiliyor...");
    try {
      const contract = await getSignerContract();
      const tx = await contract.createProposal(description.trim());
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("Öneri oluşturuldu! 30 gün içinde oy toplanacak.", { id: toastId });
      setDescription("");
      refresh();
    } catch (e) {
      toast.error(e?.reason || e?.message || "İşlem başarısız.", { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (proposalId, support) => {
    const key = `${Number(proposalId)}-${support ? "yes" : "no"}`;
    setVoting(key);
    const toastId = toast.loading(support ? "Evet oyu gönderiliyor..." : "Hayır oyu gönderiliyor...");
    try {
      const contract = await getSignerContract();
      const tx = await contract.castVote(proposalId, support);
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success(support ? "✅ Evet oyunuz kaydedildi!" : "❌ Hayır oyunuz kaydedildi!", { id: toastId });
      refresh();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Oy başarısız.", { id: toastId });
    } finally {
      setVoting(null);
    }
  };

  const handleFinalize = async (proposalId) => {
    setFinalizing(Number(proposalId));
    const toastId = toast.loading("Oylama kapatılıyor...");
    try {
      const contract = await getSignerContract();
      const tx = await contract.finalizeExpired(proposalId);
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("Oylama kapatıldı — RED olarak sonuçlandı.", { id: toastId });
      refresh();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Kapatma başarısız.", { id: toastId });
    } finally {
      setFinalizing(null);
    }
  };

  const active    = proposals.filter((p) => !p.finalized);
  const completed = proposals.filter((p) => p.finalized);
  const passed    = proposals.filter((p) => p.finalized && p.passed);
  const displayed = filter === "active" ? active
    : filter === "passed" ? passed
    : completed.filter((p) => !p.passed);

  /* ── Not deployed ── */
  if (!isGovernanceDeployed()) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/15 flex-shrink-0">
            <AlertTriangle size={22} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] mb-2">
              GovernanceVoting Kontratı Deploy Edilmedi
            </h3>
            <div className="space-y-1.5 text-xs text-[var(--text-dim)]">
              <p>1. Remix → <code className="text-brand-400">GovernanceVoting.sol</code> → Compile (0.8.20)</p>
              <p>2. Constructor: <code className="text-brand-400">0x88685937552a455C229cfdbcEF0EaFa6B2F68529</code></p>
              <p>3. Deploy → Adresi kopyala</p>
              <p>4. <code className="text-brand-400">addresses.js → GOVERNANCE_VOTING_ADDRESS</code> güncelle</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aktif Oylama",   value: active.length,    color: "text-brand-400" },
          { label: "Kabul Edilen",   value: passed.length,    color: "text-emerald-400" },
          { label: "Reddedilen",     value: completed.filter(p => !p.passed).length, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="xl:col-span-1">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone size={16} className="text-purple-400" />
              <h3 className="font-semibold text-[var(--text-primary)]">Yeni Öneri Oluştur</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Tüm paydaşların <strong>%51'i</strong> YES oyu verirse kabul edilir.
              <br />Süre: <strong>30 gün</strong>. Süre dolarsa otomatik RED.
            </p>
            <form onSubmit={handleCreate} className="space-y-3">
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="Oylamaya sunmak istediğiniz karar veya önergeyi açıklayın..."
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              />
              <p className="text-[10px] text-[var(--text-dim)] text-right">{description.length}/500</p>
              <TxButton type="submit" loading={creating} icon={Vote} className="w-full">
                Oylamaya Sun
              </TxButton>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              {[
                { id: "active",   label: `Aktif (${active.length})` },
                { id: "passed",   label: `Kabul (${passed.length})` },
                { id: "rejected", label: `Red (${completed.filter(p => !p.passed).length})` },
              ].map((t) => (
                <button key={t.id} onClick={() => setFilter(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === t.id
                      ? t.id === "passed"   ? "bg-emerald-500 text-white shadow"
                      : t.id === "rejected" ? "bg-red-500 text-white shadow"
                      :                       "bg-purple-500 text-white shadow"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={refresh} className="p-2 rounded-xl hover:bg-[var(--bg-card)] text-[var(--text-dim)] transition-colors">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map((i) => <SkeletonWorkItem key={i} />)}</div>
          ) : displayed.length === 0 ? (
            <div className="card p-10 text-center text-[var(--text-dim)] text-sm">
              {filter === "active"   ? "Aktif oylama yok. İlk öneriyi sen oluştur!" :
               filter === "passed"   ? "Henüz kabul edilen öneri yok." :
                                       "Henüz reddedilen öneri yok."}
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((p) => (
                <ProposalCard
                  key={Number(p.id)}
                  proposal={p}
                  account={wallet.account}
                  onVote={handleVote}
                  onFinalize={handleFinalize}
                  voting={voting}
                  finalizing={finalizing}
                  onRefresh={refresh}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsPage;
