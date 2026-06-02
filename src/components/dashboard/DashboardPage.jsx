import React from "react";
import { Coins, Clock, Vote, TrendingUp } from "lucide-react";
import MetricCard from "../ui/MetricCard";
import NFTCard from "../ui/NFTCard";
import { useApp } from "../../context/AppContext";

const DashboardPage = () => {
  const { contributor, dividend, workItems } = useApp();
  const { memberStats, tokenBalance, loading, contributors } = contributor;
  const { pendingRewards } = dividend;
  const { workItems: items } = workItems;

  const totalSupply  = contributors.reduce((acc, c) => acc + Number(c.balance), 0);
  const myBalance    = Number(tokenBalance || 0n);
  const votingPower  = totalSupply > 0 ? ((myBalance / totalSupply) * 100).toFixed(2) : "0.00";
  const myHours      = memberStats ? Number(memberStats.hours) : 0;
  const myApproved   = items.filter(
    (w) => w.finalized && w.approved &&
           w.submitter?.toLowerCase() === contributor?.memberStats?.role?.toLowerCase()
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="EQT Bakiyem"
          value={`${(myBalance / 1e18).toFixed(4)} EQT`}
          sub="Hisse tokeni"
          icon={Coins}
          accent
          loading={loading}
        />
        <MetricCard
          label="Toplam Emeğim"
          value={`${myHours} Saat`}
          sub="NFT'de kayıtlı"
          icon={Clock}
          loading={loading}
        />
        <MetricCard
          label="Oy Gücüm"
          value={`%${votingPower}`}
          sub="Token arzı bazında"
          icon={Vote}
          loading={loading}
        />
        <MetricCard
          label="Birikmiş Temettü"
          value={`${(Number(pendingRewards || 0n) / 1e18).toFixed(6)} ETH`}
          sub="Çekilebilir"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* NFT card + contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NFT identity card */}
        <div className="lg:col-span-1">
          <NFTCard
            memberStats={memberStats}
            account={contributor?.memberStats ? undefined : null}
            loading={loading}
            tokenBalance={tokenBalance}
          />
        </div>

        {/* Contributors table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text-primary)]">Paydaşlar</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {contributors.length} aktif üye
            </p>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="skeleton h-8 w-48 rounded-lg" />
                  <div className="skeleton h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          ) : contributors.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-dim)] text-sm">
              Henüz paydaş eklenmemiş.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Adres", "Rol", "Saat", "EQT", "Oy Gücü"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-[var(--text-dim)] font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {contributors.map((c) => {
                    const bal = Number(c.balance) / 1e18;
                    const vp  = totalSupply > 0 ? ((Number(c.balance) / totalSupply) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={c.address} className="hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-primary)]">
                          {c.address.slice(0, 8)}...{c.address.slice(-6)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            {c.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{Number(c.hours)}s</td>
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{bal.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden max-w-16">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${vp}%` }}
                              />
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">%{vp}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
