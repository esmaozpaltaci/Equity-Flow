import React, { useState } from "react";
import {
  ThumbsUp, ThumbsDown, CheckCircle2, XCircle,
  User, Clock, Flag, PenLine, Shield, Timer,
} from "lucide-react";
import toast from "react-hot-toast";
import TxButton from "../ui/TxButton";
import StatusTag from "../ui/StatusTag";
import { getSignerContract } from "../../hooks/useProposals";
import { shortenAddress, formatTimestamp } from "../../utils/formatters";

/* ── Helper: kalan süreyi formatla ── */
const formatTimeLeft = (secs) => {
  const s = Number(secs);
  if (s <= 0) return "Süresi doldu";
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}g ${h}s kaldı`;
  if (h > 0) return `${h}s ${m}dk kaldı`;
  return `${m}dk kaldı`;
};

const ProposalCard = ({ proposal, account, onVote, onFinalize, voting, finalizing, onRefresh }) => {
  const {
    id, proposer, description,
    yesVotes, noVotes, finalized, passed,
    deadline, totalContributors, requiredVotes,
    secsLeft, hasVoted, voteChoice, hasSigned,
    implLogs, signers,
  } = proposal;

  const [logNote, setLogNote]       = useState("");
  const [addingLog, setAddingLog]   = useState(false);
  const [signing, setSigning]       = useState(false);
  const [showLogs, setShowLogs]     = useState(false);

  const isOwn      = account?.toLowerCase() === proposer?.toLowerCase();
  const isExpired  = Number(secsLeft) === 0 && !finalized;
  const totalVotes = Number(yesVotes) + Number(noVotes);
  const required   = Number(requiredVotes);
  const total      = Number(totalContributors);
  const yesPct     = total > 0 ? Math.min(100, Math.round((Number(yesVotes) / total) * 100)) : 0;
  const noPct      = total > 0 ? Math.min(100, Math.round((Number(noVotes)  / total) * 100)) : 0;
  const progress   = total > 0 ? Math.min(100, Math.round((Number(yesVotes) / required) * 100)) : 0;

  const status = finalized
    ? passed ? "approved" : "rejected"
    : isExpired ? "rejected" : "pending";
  const statusLabel = finalized
    ? passed ? "✅ Kabul" : "❌ Red"
    : isExpired ? "⏰ Süresi Doldu" : "⏳ Oylamada";

  /* ── [A] Uygulama Logu Ekle ── */
  const handleAddLog = async () => {
    if (!logNote.trim()) return;
    setAddingLog(true);
    const toastId = toast.loading("Log ekleniyor...");
    try {
      const contract = await getSignerContract();
      const tx = await contract.addImplementationLog(id, logNote.trim());
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("Uygulama notu blockchain'e eklendi!", { id: toastId });
      setLogNote("");
      onRefresh();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Hata.", { id: toastId });
    } finally {
      setAddingLog(false);
    }
  };

  /* ── [B] Kabul İmzala ── */
  const handleSign = async () => {
    setSigning(true);
    const toastId = toast.loading("İmza gönderiliyor...");
    try {
      const contract = await getSignerContract();
      const tx = await contract.signAcceptance(id);
      toast.loading("Blockchain onayı bekleniyor...", { id: toastId });
      await tx.wait();
      toast.success("Kararı kabul ettiğiniz blockchain'e kaydedildi!", { id: toastId });
      onRefresh();
    } catch (e) {
      toast.error(e?.reason || e?.message || "Hata.", { id: toastId });
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="card p-5 animate-slide-up space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs text-[var(--text-dim)]">{shortenAddress(proposer)}</p>
            {isOwn && <p className="text-[10px] text-purple-400 font-semibold">Senin önergen</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!finalized && !isExpired && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400">
              <Timer size={10} />
              {formatTimeLeft(secsLeft)}
            </span>
          )}
          <StatusTag status={status} label={statusLabel} />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-primary)] leading-relaxed border-l-2 border-purple-500/40 pl-3">
        {description}
      </p>

      {/* Vote progress toward required */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[var(--text-dim)]">
          <span>
            <span className="text-emerald-400 font-semibold">{Number(yesVotes)} YES</span>
            {" / "}
            <span className="font-semibold text-[var(--text-muted)]">{required} gerekli</span>
            {" "}
            <span className="text-[10px]">({total} paydaşın %51'i)</span>
          </span>
          <span className="text-red-400">{Number(noVotes)} NO</span>
        </div>
        {/* Green = yes toward threshold */}
        <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? "#10b981" : "linear-gradient(90deg,#6366f1,#8b5cf6)",
            }}
          />
        </div>
        {/* Deadline bar */}
        {!finalized && (
          <div className="h-1 rounded-full bg-[var(--bg-primary)] overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-amber-500/60 transition-all"
              style={{
                width: `${Math.min(100, Math.round((Number(secsLeft) / (30 * 86400)) * 100))}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Actions — active proposal */}
      {!finalized && !isExpired && (
        <div className="space-y-2 pt-1">
          {!hasVoted && !isOwn && (
            <div className="flex gap-2">
              <TxButton onClick={() => onVote(id, true)}  loading={voting === `${Number(id)}-yes`} icon={ThumbsUp}   variant="success" size="sm" className="flex-1">Evet</TxButton>
              <TxButton onClick={() => onVote(id, false)} loading={voting === `${Number(id)}-no`}  icon={ThumbsDown} variant="danger"  size="sm" className="flex-1">Hayır</TxButton>
            </div>
          )}
          {hasVoted && (
            <p className={`text-xs font-semibold flex items-center gap-1 ${voteChoice ? "text-emerald-400" : "text-red-400"}`}>
              {voteChoice ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
              {voteChoice ? "Evet oyladınız" : "Hayır oyladınız"}
            </p>
          )}
          {isOwn && !hasVoted && (
            <p className="text-xs text-[var(--text-dim)]">Kendi önergenize oy kullanamazsınız</p>
          )}
        </div>
      )}

      {/* Expired or mathematically failed — can finalize */}
      {(isExpired || (proposal.mathematicallyFailed && Number(secsLeft) === 0)) && (
        <TxButton onClick={() => onFinalize(id)} loading={finalizing === Number(id)} icon={Flag} variant="secondary" size="sm" className="w-full">
          Süresi Doldu — Kapat (RED)
        </TxButton>
      )}

      {/* ── PASSED proposal extras ── */}
      {finalized && passed && (
        <div className="space-y-3 pt-1 border-t border-[var(--border)]">

          {/* [B] Kabul İmzası */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Shield size={11} className="text-brand-400" />
                Kabul İmzaları ({signers.length}/{total})
              </p>
              {!hasSigned && (
                <TxButton onClick={handleSign} loading={signing} icon={PenLine} size="sm" className="!py-1 !px-2 !text-[10px]">
                  İmzala
                </TxButton>
              )}
              {hasSigned && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={10} /> İmzaladınız
                </span>
              )}
            </div>
            {signers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {signers.map((s) => (
                  <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {shortenAddress(s)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* [A] Uygulama Logları */}
          <div>
            <button
              className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5 mb-2 hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setShowLogs((v) => !v)}
            >
              <PenLine size={11} className="text-emerald-400" />
              Uygulama Kayıtları ({implLogs.notes.length})
              <span className="text-[10px] opacity-60">{showLogs ? "▲" : "▼"}</span>
            </button>

            {showLogs && (
              <div className="space-y-2">
                {implLogs.notes.map((note, i) => (
                  <div key={i} className="px-3 py-2 rounded-xl bg-[var(--bg-primary)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-brand-400">{shortenAddress(implLogs.contributors[i])}</span>
                      <span className="text-[10px] text-[var(--text-dim)]">{formatTimestamp(implLogs.timestamps[i])}</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{note}</p>
                  </div>
                ))}

                {/* Add log input */}
                <div className="flex gap-2 mt-2">
                  <input
                    className="input flex-1 text-xs py-1.5"
                    placeholder="Uyguladığınız adımı yazın..."
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddLog()}
                  />
                  <TxButton onClick={handleAddLog} loading={addingLog} size="sm" className="flex-shrink-0">
                    Ekle
                  </TxButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed result */}
      {finalized && !passed && (
        <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <XCircle size={16} />
            Red ({Number(yesVotes)}/{required} YES, {Number(noVotes)} NO)
          </div>
          {proposal.mathematicallyFailed && Number(secsLeft) > 0 && (
            <p className="text-[10px] text-[var(--text-dim)] pl-6">
              Kalan oyların tamamı EVET olsa bile %51 eşiğine ulaşılamayacağı için yönerge otomatik olarak reddedildi.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
