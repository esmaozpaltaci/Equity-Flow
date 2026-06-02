import React from "react";
import { Clock, User, CheckCircle2, ThumbsUp } from "lucide-react";
import StatusTag from "./StatusTag";
import TxButton from "./TxButton";
import { shortenAddress, formatTimestamp } from "../../utils/formatters";

const WorkItemCard = ({
  item,
  account,
  contribCount,
  onApprove,
  approving,
}) => {
  const {
    id, submitter, description, hours, timestamp,
    approvalCount, finalized, approved, hasApproved,
  } = item;

  const isOwn       = account?.toLowerCase() === submitter?.toLowerCase();
  const canApprove  = !finalized && !isOwn && !hasApproved;
  
  // Smart Contract Logic: others = contribCount > 1 ? contribCount - 1 : 1
  // threshold = (others * 51 + 99) / 100
  const others      = contribCount > 1n ? contribCount - 1n : 1n;
  const threshold   = (others * 51n + 99n) / 100n;
  
  const progress    = threshold > 0n
    ? Math.min(100, Math.round((Number(approvalCount) / Number(threshold)) * 100))
    : 0;

  const status = finalized && approved ? "finalized"
    : finalized && !approved ? "rejected"
    : "pending";

  return (
    <div className="card card-hover p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-dim)] font-mono">{shortenAddress(submitter)}</p>
            {isOwn && (
              <span className="text-[10px] text-brand-400 font-semibold">Senin işin</span>
            )}
          </div>
        </div>
        <StatusTag status={status} />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-primary)] mb-3 leading-relaxed">{description}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-dim)] mb-3">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {Number(hours)} saat
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} />
          {Number(approvalCount)} onay
        </span>
        <span>{formatTimestamp(timestamp)}</span>
      </div>

      {/* Progress bar (only for pending) */}
      {status === "pending" && contribCount > 1n && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-[var(--text-dim)] mb-1">
            <span>Onay İlerlemesi</span>
            <span>{Number(approvalCount)} / {Number(threshold)} (%51 eşiği)</span>
          </div>
          <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      {canApprove && (
        <TxButton
          onClick={() => onApprove(id)}
          loading={approving === Number(id)}
          icon={ThumbsUp}
          size="sm"
          className="w-full mt-1"
        >
          Onayla
        </TxButton>
      )}

      {/* Already approved */}
      {hasApproved && !finalized && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
          <CheckCircle2 size={12} />
          Onayladınız
        </div>
      )}

      {/* Finalized result */}
      {finalized && approved && (
        <div className="flex items-center gap-1.5 text-xs text-brand-400 mt-1">
          <CheckCircle2 size={12} />
          Token verildi — iş tamamlandı
        </div>
      )}
    </div>
  );
};

export default WorkItemCard;
