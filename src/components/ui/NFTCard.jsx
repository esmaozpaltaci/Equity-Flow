import React from "react";
import { Clock, Briefcase, Hexagon, Star } from "lucide-react";
import { SkeletonNFT } from "./SkeletonCard";
import { shortenAddress, formatTimestamp } from "../../utils/formatters";

const NFTCard = ({ memberStats, account, loading = false, tokenBalance }) => {
  if (loading) return <SkeletonNFT />;

  const hours     = memberStats ? Number(memberStats.hours) : 0;
  const role      = memberStats?.role || "Paydaş";
  const timestamp = memberStats?.timestamp;

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* NFT Image area — gold coin style */}
      <div className="relative flex items-center justify-center py-6"
        style={{
          background: "linear-gradient(160deg, #1a1200 0%, #2d1f00 40%, #1a1200 100%)",
        }}
      >
        {/* Ambient gold glow behind coin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: 200, height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)",
            filter: "blur(24px)",
          }} />
        </div>

        {/* Coin image */}
        <div className="relative z-10">
          <img
            src="/member_nft.jpg"
            alt="Member NFT"
            className="w-40 h-40 object-contain drop-shadow-2xl"
            style={{ imageRendering: "pixelated" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback */}
          <div className="hidden w-40 h-40 items-center justify-center">
            <Hexagon size={64} className="text-yellow-400 opacity-60" />
          </div>
        </div>

        {/* NFT badge — top right */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm border"
            style={{
              background: "rgba(251,191,36,0.15)",
              borderColor: "rgba(251,191,36,0.4)",
              color: "#fbbf24",
            }}
          >
            <Star size={10} fill="currentColor" />
            Member NFT
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="p-5 space-y-4">
        {/* Address */}
        <div>
          <p className="text-xs text-[var(--text-dim)] mb-1">Cüzdan Adresi</p>
          <p className="font-mono text-sm font-medium text-[var(--text-primary)]">
            {account ? shortenAddress(account) : "—"}
          </p>
        </div>

        {/* Role + Hours badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/25">
            <Briefcase size={12} className="text-brand-400" />
            <span className="text-xs font-semibold text-brand-400">{role}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
            <Clock size={12} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">{hours} Saat</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl bg-[var(--bg-primary)] p-3">
            <p className="text-xs text-[var(--text-dim)] mb-1">Toplam Saat</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{hours}s</p>
          </div>
          <div className="rounded-xl bg-[var(--bg-primary)] p-3">
            <p className="text-xs text-[var(--text-dim)] mb-1">Son Aktivite</p>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {timestamp && Number(timestamp) > 0 ? formatTimestamp(timestamp) : "Henüz yok"}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-[var(--border)]" />

        {/* Token balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">EQT Bakiyesi</span>
          <span className="font-bold text-[var(--text-primary)]">
            {tokenBalance !== undefined
              ? (Number(tokenBalance) / 1e18).toFixed(4)
              : "—"}{" "}
            <span className="text-brand-400 text-xs">EQT</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
