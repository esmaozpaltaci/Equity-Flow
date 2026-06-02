import React, { useState } from "react";
import { RefreshCw, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import WorkItemCard from "../ui/WorkItemCard";
import { SkeletonWorkItem } from "../ui/SkeletonCard";
import TxButton from "../ui/TxButton";
import { useApp } from "../../context/AppContext";

const WorkFeed = () => {
  const { workItems: { workItems, loading, contribCount, refresh }, wallet, getSignerContracts, refreshAll } = useApp();
  const [approvingId, setApprovingId] = useState(null);
  const [filter, setFilter]           = useState("pending"); // "pending" | "done"

  const pending   = workItems.filter((w) => !w.finalized);
  const completed = workItems.filter((w) => w.finalized);
  const displayed = filter === "pending" ? pending : completed;

  const handleApprove = async (workId) => {
    setApprovingId(Number(workId));
    const toastId = toast.loading("Onay gönderiliyor...");
    try {
      const { engine } = await getSignerContracts();
      const tx = await engine.approveWork(workId);
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("İş onaylandı!", { id: toastId });
      refreshAll();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Onay başarısız.", { id: toastId });
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
          <FilterBtn
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
            icon={Clock}
            label={`Bekleyen (${pending.length})`}
          />
          <FilterBtn
            active={filter === "done"}
            onClick={() => setFilter("done")}
            icon={CheckCircle}
            label={`Tamamlanan (${completed.length})`}
          />
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-xl hover:bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-colors"
          title="Yenile"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Work items */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonWorkItem key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[var(--text-dim)] text-sm">
            {filter === "pending" ? "Bekleyen iş yok." : "Tamamlanan iş yok."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((item) => (
            <WorkItemCard
              key={Number(item.id)}
              item={item}
              account={wallet.account}
              contribCount={contribCount}
              onApprove={handleApprove}
              approving={approvingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FilterBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
      active
        ? "bg-brand-500 text-white shadow"
        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    }`}
  >
    <Icon size={12} />
    {label}
  </button>
);

export default WorkFeed;
