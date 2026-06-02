import React from "react";
import { TrendingUp } from "lucide-react";
import { SkeletonMetric } from "./SkeletonCard";

const MetricCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  loading = false,
  className = "",
}) => {
  if (loading) return <SkeletonMetric className={className} />;

  return (
    <div className={`card card-hover p-5 glow-bg ${className} ${accent ? "border-brand-500/30" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
        {Icon && (
          <span
            className={`p-2 rounded-xl ${
              accent
                ? "bg-brand-500/15 text-brand-400"
                : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
            }`}
          >
            <Icon size={16} />
          </span>
        )}
      </div>
      <p
        className={`text-2xl font-bold mb-1 ${
          accent ? "text-gradient" : "text-[var(--text-primary)]"
        }`}
      >
        {value ?? "—"}
      </p>
      {sub && (
        <p className="text-xs text-[var(--text-dim)] flex items-center gap-1">
          <TrendingUp size={11} />
          {sub}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
