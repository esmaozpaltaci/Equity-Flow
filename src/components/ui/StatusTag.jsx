import React from "react";

const STATUS_STYLES = {
  pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  finalized: "bg-brand-500/15 text-brand-400 border-brand-500/30",
  rejected:  "bg-red-500/15 text-red-400 border-red-500/30",
  active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  admin:     "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STATUS_LABELS = {
  pending:   "⏳ Bekliyor",
  approved:  "✅ Onaylandı",
  finalized: "🎯 Tamamlandı",
  rejected:  "❌ Reddedildi",
  active:    "🟢 Aktif",
  admin:     "👑 Admin",
};

const StatusTag = ({ status, label, className = "" }) => {
  const styleClass = STATUS_STYLES[status] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} ${className}`}
    >
      {displayLabel}
    </span>
  );
};

export default StatusTag;
