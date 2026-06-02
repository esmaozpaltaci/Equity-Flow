import React from "react";
import { Wallet, AlertTriangle, Shield, RefreshCw } from "lucide-react";
import TxButton from "./ui/TxButton";

const WalletGate = ({ wallet, isContributor, isAdmin }) => {
  const {
    account, isCorrectNetwork, isConnecting,
    error, connect, switchNetwork,
  } = wallet;

  /* ── MetaMask yok ── */
  if (typeof window.ethereum === "undefined") {
    return (
      <GateWrapper>
        <Shield size={48} className="text-brand-400 mb-5" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">MetaMask Gerekli</h2>
        <p className="text-[var(--text-muted)] mb-6 max-w-sm text-center text-sm">
          Bu uygulamayı kullanmak için MetaMask tarayıcı eklentisi gereklidir.
        </p>
        <a href="https://metamask.io/download/" target="_blank" rel="noreferrer"
          className="btn btn-primary btn-lg">MetaMask İndir</a>
      </GateWrapper>
    );
  }

  /* ── Bağlı hesap yok ── */
  if (!account) {
    return (
      <GateWrapper>
        <div className="w-24 h-24 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-6 animate-glow-pulse">
          <Wallet size={44} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Cüzdanınızı Bağlayın</h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-xs text-center text-sm leading-relaxed">
          EquityFlow'a erişmek için MetaMask cüzdanınızı bağlamanız gerekmektedir.
        </p>

        <TxButton onClick={connect} loading={isConnecting} size="lg" icon={Wallet} className="w-full max-w-xs">
          MetaMask ile Bağlan
        </TxButton>

        {/* Bağlanıyor mesajı */}
        {isConnecting && (
          <div className="mt-5 px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/25 max-w-xs text-center">
            <p className="text-xs text-brand-300 font-medium mb-1">MetaMask popup'ı bekliyor...</p>
            <p className="text-[10px] text-brand-400/70">
              MetaMask simgesine tıklayıp onaylayın.
            </p>
          </div>
        )}

        {/* Hata */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 max-w-xs text-center">
            <p className="text-xs text-red-400 mb-2">{error}</p>
            <button onClick={connect} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mx-auto">
              <RefreshCw size={10} /> Tekrar Dene
            </button>
          </div>
        )}

        {/* Hesap değiştirme rehberi */}
        <div className="mt-6 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] max-w-xs text-left space-y-1.5">
          <p className="text-xs font-semibold text-[var(--text-muted)]">💡 Farklı hesapla giriş için:</p>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">1. MetaMask simgesine tıkla</p>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">2. Üstteki hesap adına tıkla → farklı hesabı seç</p>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">3. Buraya dön → <strong className="text-brand-400">"MetaMask ile Bağlan"</strong> de</p>
        </div>
      </GateWrapper>
    );
  }

  /* ── Yanlış ağ ── */
  if (!isCorrectNetwork) {
    return (
      <GateWrapper>
        <div className="w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Yanlış Ağ</h2>
        <p className="text-[var(--text-muted)] mb-2 max-w-sm text-center text-sm">
          Bu uygulama <strong className="text-amber-400">Ethereum Sepolia Testnet</strong> üzerinde çalışmaktadır.
        </p>
        <p className="text-[var(--text-dim)] mb-8 text-xs">Lütfen ağı değiştirin.</p>
        <TxButton onClick={switchNetwork} variant="secondary" size="lg" icon={AlertTriangle}>
          Sepolia'ya Geç
        </TxButton>
      </GateWrapper>
    );
  }

  /* ── Paydaş değil ── */
  if (!isContributor && !isAdmin) {
    return (
      <GateWrapper>
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Shield size={40} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Paydaş Değilsiniz</h2>
        <p className="text-[var(--text-muted)] mb-4 max-w-sm text-center text-sm leading-relaxed">
          Bu çalışma alanına erişim yalnızca kayıtlı paydaşlara açıktır.
        </p>
        <div className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] font-mono text-xs text-[var(--text-muted)] mb-5 max-w-xs break-all text-center">
          {account}
        </div>
        <div className="px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] max-w-xs text-left space-y-1.5">
          <p className="text-xs font-semibold text-[var(--text-muted)]">💡 Farklı hesapla dene:</p>
          <p className="text-[11px] text-[var(--text-dim)]">1. MetaMask'ta hesap değiştir</p>
          <p className="text-[11px] text-[var(--text-dim)]">2. Sayfa otomatik güncellenir</p>
        </div>
      </GateWrapper>
    );
  }

  return null;
};

const GateWrapper = ({ children }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6"
    style={{ background: "var(--bg-primary)" }}>
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)", filter: "blur(80px)" }} />
    </div>
    <div className="relative flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-10 opacity-50">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <span className="text-white text-xs font-bold">EF</span>
        </div>
        <span className="text-sm font-semibold text-[var(--text-muted)]">EquityFlow</span>
      </div>
      {children}
    </div>
  </div>
);

export default WalletGate;
