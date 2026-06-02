import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Wallet, LogOut, RefreshCw, ChevronDown, X, ArrowRight, Users } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { shortenAddress } from "../../utils/formatters";

const TopBar = () => {
  const { darkMode, toggleDarkMode, workspaceName, wallet, refreshAll } = useApp();
  const { account, connect, disconnect, isConnecting, switchAccountReal } = wallet;
  const [menuOpen, setMenuOpen]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitchClick = () => {
    setMenuOpen(false);
    setShowModal(true);
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-30">
        {/* Sol */}
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[200px]">{workspaceName}</span>
          <span className="hidden sm:block text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 font-medium">Sepolia</span>
        </div>

        {/* Sağ */}
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title={darkMode ? "Light Mode" : "Dark Mode"}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={refreshAll}
            className="p-2 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title="Verileri Yenile">
            <RefreshCw size={16} />
          </button>

          {account ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/25 hover:bg-brand-500/25 transition-all">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <span className="font-mono text-xs text-brand-300 font-medium">{shortenAddress(account)}</span>
                <ChevronDown size={12} className={`text-brand-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[var(--border)] shadow-xl z-50 overflow-hidden"
                  style={{ background: "var(--bg-card)" }}>
                  <div className="px-3 py-2.5 border-b border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-dim)] mb-0.5">Bağlı Cüzdan</p>
                    <p className="font-mono text-[10px] text-[var(--text-primary)] break-all">{account}</p>
                  </div>
                  <button onClick={handleSwitchClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors">
                    <Users size={14} className="text-brand-400" />
                    Hesap Değiştir
                  </button>
                  <button onClick={() => { setMenuOpen(false); disconnect(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} />
                    Bağlantıyı Kes
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={connect} disabled={isConnecting} className="btn btn-primary btn-sm">
              <Wallet size={14} />
              {isConnecting ? "Bağlanıyor..." : "Bağlan"}
            </button>
          )}
        </div>
      </header>

      {showModal && (
        <SwitchAccountModal
          onClose={() => setShowModal(false)}
          onSwitch={switchAccountReal}
          isConnecting={isConnecting}
        />
      )}
    </>
  );
};

/* ── Hesap Değiştir Modal ── */
const SwitchAccountModal = ({ onClose, onSwitch, isConnecting }) => {
  const [error, setError] = useState("");
  const [waitingForMetaMask, setWaitingForMetaMask] = useState(false);

  const handleSwitch = async () => {
    setError("");
    setWaitingForMetaMask(true);
    
    // MetaMask'ın yanıt vermemesi durumunda UI'ı düzeltmek için timeout
    const timeout = new Promise((resolve) => setTimeout(() => resolve("timeout"), 5000));
    const switchPromise = onSwitch();
    
    const result = await Promise.race([switchPromise, timeout]);
    
    if (result === "timeout") {
      setError("MetaMask penceresi açılmadı veya arka planda kaldı. Lütfen tarayıcınızın sağ üst köşesindeki MetaMask simgesine (🦊) tıklayarak onay verin.");
      // Timeout olsa bile işlem arkada devam ediyor olabilir, butonu açık bırak
    } else {
      setWaitingForMetaMask(false);
      if (result === "ok") {
        onClose();
      } else if (result === "pending") {
        setError("MetaMask'ta bekleyen bir istek var. Lütfen tarayıcınızın sağ üst köşesindeki MetaMask simgesine (🦊) tıklayın.");
      } else {
        setError("Bağlantı başarısız. Farklı bir hesap seçin veya tekrar deneyin.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="card p-6 w-full max-w-sm space-y-5" style={{ background: "var(--bg-card)" }}>
        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Hesap Değiştir</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Gerçek MetaMask bağlantısı kurar</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-dim)]">
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          Geçiş yapmak istediğiniz hesabın bu uygulamayla bağlantı kurmasına izin vermek için aşağıdaki butona tıklayın ve açılan MetaMask penceresinden ilgili hesabı seçin.
        </p>

        {(error || waitingForMetaMask) && (
          <div className={`px-3 py-3 rounded-xl border text-xs text-center ${error ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-brand-500/10 border-brand-500/25 text-brand-300'}`}>
            {error || (
              <span className="flex flex-col gap-1 items-center justify-center">
                <span className="font-semibold text-sm">MetaMask Bekleniyor...</span>
                <span>Pencere açılmadıysa sağ üstteki 🦊 MetaMask simgesine tıklayın.</span>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--bg-primary)] transition-all">
            İptal
          </button>
          <button onClick={handleSwitch} disabled={isConnecting && !waitingForMetaMask}
            className="flex-1 btn btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {isConnecting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight size={15} />
            )}
            {isConnecting ? "Bekleniyor..." : "Hesap Seç"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
