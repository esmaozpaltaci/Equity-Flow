import React from "react";
import { Toaster } from "react-hot-toast";
import { AppProvider, useApp } from "./context/AppContext";
import AppShell from "./components/layout/AppShell";
import WalletGate from "./components/WalletGate";
import DashboardPage from "./components/dashboard/DashboardPage";
import WorkFeed from "./components/dashboard/WorkFeed";
import SubmitWork from "./components/dashboard/SubmitWork";
import FinancialPanel from "./components/dashboard/FinancialPanel";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProposalsPage from "./components/proposals/ProposalsPage";

const AppContent = () => {
  const { wallet, contributor, activeTab, darkMode } = useApp();
  const { account, isCorrectNetwork } = wallet;
  const { isContributor, isAdmin, loading } = contributor;

  // Sync dark mode class (dark mode init is handled in index.html script + AppContext)
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Show gate screens
  if (!account || !isCorrectNetwork || (!isContributor && !isAdmin && !loading)) {
    return (
      <WalletGate
        wallet={wallet}
        isContributor={isContributor}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <AppShell>
      {activeTab === "dashboard" && <DashboardPage />}

      {activeTab === "work" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <SubmitWork />
          </div>
          <div className="xl:col-span-2">
            <WorkFeed />
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="max-w-2xl mx-auto">
          <FinancialPanel />
        </div>
      )}

      {activeTab === "proposals" && <ProposalsPage />}

      {activeTab === "admin" && isAdmin && (
        <div className="max-w-2xl mx-auto">
          <AdminDashboard />
        </div>
      )}
    </AppShell>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#F1F5F9",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#1E293B" } },
          error:   { iconTheme: { primary: "#ef4444", secondary: "#1E293B" } },
        }}
      />
    </AppProvider>
  );
}

export default App;
