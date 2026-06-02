import React, { useState } from "react";
import { Shield, Edit3, Save, Users } from "lucide-react";
import AddContributor from "./AddContributor";
import DepositRevenue from "./DepositRevenue";
import { useApp } from "../../context/AppContext";
import { shortenAddress } from "../../utils/formatters";

const TABS = [
  { id: "add",     label: "Paydaş Ekle" },
  { id: "revenue", label: "Gelir Yatır" },
  { id: "team",    label: "Ekip" },
  { id: "setup",   label: "Kurulum" },
];

const AdminDashboard = () => {
  const { workspaceName, saveWorkspaceName, contributor } = useApp();
  const [localTab, setLocalTab]   = useState("add");
  const [editing, setEditing]     = useState(false);
  const [nameInput, setNameInput] = useState(workspaceName);
  const { contributors }          = contributor;

  const handleSaveName = () => {
    if (nameInput.trim()) saveWorkspaceName(nameInput.trim());
    setEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin header */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/25">
            <Shield size={20} className="text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {editing ? (
                <input
                  className="input py-1 px-2 text-sm w-48"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
              ) : (
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {workspaceName}
                </h2>
              )}
              <button
                onClick={() => (editing ? handleSaveName() : setEditing(true))}
                className="p-1 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-dim)] hover:text-brand-400 transition-colors"
                title={editing ? "Kaydet" : "Adı Düzenle"}
              >
                {editing ? <Save size={14} /> : <Edit3 size={14} />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-dim)]">Admin Paneli — Sadece siz görebilirsiniz</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Users size={14} />
          <span>{contributors.length} Paydaş</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setLocalTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              localTab === t.id
                ? "bg-brand-500 text-white shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {localTab === "add"     && <AddContributor />}
      {localTab === "revenue" && <DepositRevenue />}
      {localTab === "team"    && <TeamView contributors={contributors} />}
      {localTab === "setup"   && <SetupView />}
    </div>
  );
};

const SetupView = () => {
  const { getSignerContracts } = useApp();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("unknown"); // unknown | granted | missing

  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  const checkRole = async () => {
    try {
      const { token, engine } = await getSignerContracts();
      const hasMinter = await token.hasRole(MINTER_ROLE, await engine.getAddress());
      setStatus(hasMinter ? "granted" : "missing");
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    checkRole();
  }, []);

  const grantRole = async () => {
    setLoading(true);
    try {
      const { token, engine } = await getSignerContracts();
      const tx = await token.grantRole(MINTER_ROLE, await engine.getAddress());
      await tx.wait();
      setStatus("granted");
      alert("Yetki başarıyla verildi!");
    } catch (e) {
      console.error(e);
      alert("Hata: " + (e?.reason || e?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <h3 className="font-semibold text-[var(--text-primary)]">Sistem Yetkileri</h3>
      <p className="text-sm text-[var(--text-muted)]">
        Sistemin onaylanan işler sonucunda otomatik token basabilmesi için MainEngine kontratının Token kontratında MINTER_ROLE yetkisine sahip olması gerekir.
      </p>

      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Token Basma Yetkisi (MINTER_ROLE)</p>
          <p className="text-xs mt-1">
            {status === "unknown" ? <span className="text-[var(--text-dim)]">Kontrol ediliyor...</span> :
             status === "granted" ? <span className="text-emerald-400">Yetki Verilmiş ✓</span> :
             <span className="text-red-400">Yetki Eksik ✗ (İş onayları hata verir)</span>}
          </p>
        </div>
        {status === "missing" && (
          <button onClick={grantRole} disabled={loading} className="btn btn-primary btn-sm">
            {loading ? "İşleniyor..." : "Yetki Ver"}
          </button>
        )}
      </div>
    </div>
  );
};

const TeamView = ({ contributors }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-[var(--border)]">
      <h3 className="font-semibold text-[var(--text-primary)]">Ekip Üyeleri</h3>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{contributors.length} kayıtlı paydaş</p>
    </div>
    {contributors.length === 0 ? (
      <div className="p-8 text-center text-[var(--text-dim)] text-sm">
        Henüz paydaş eklenmemiş.
      </div>
    ) : (
      <div className="divide-y divide-[var(--border)]">
        {contributors.map((c, i) => (
          <div key={c.address} className="flex items-center justify-between p-4 hover:bg-[var(--bg-primary)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-[var(--text-primary)]">
                  {shortenAddress(c.address)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{c.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--text-primary)]">{Number(c.hours)}s</p>
              <p className="text-xs text-[var(--text-dim)]">{(Number(c.balance) / 1e18).toFixed(2)} EQT</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AdminDashboard;
