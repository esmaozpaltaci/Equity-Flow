import React, { createContext, useContext, useState, useCallback } from "react";
import { useWallet }      from "../hooks/useWallet";
import { useContracts }   from "../hooks/useContracts";
import { useContributor } from "../hooks/useContributor";
import { useWorkItems }   from "../hooks/useWorkItems";
import { useDividend }    from "../hooks/useDividend";
import { useProposals }   from "../hooks/useProposals";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Dark mode: init from localStorage (default: true)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("equityflow_darkmode");
    return saved === null ? true : saved === "true";
  });

  const [workspaceName, setWorkspaceName] = useState(
    () => localStorage.getItem("equityflow_workspace") || "EquityFlow Workspace"
  );
  const [activeTab, setActiveTab] = useState("dashboard");

  const wallet = useWallet();
  const { readContracts, getSignerContracts } = useContracts(wallet.account);
  const contributor = useContributor(wallet.account, readContracts);
  const workItems   = useWorkItems(wallet.account, readContracts);
  const dividend    = useDividend(wallet.account, readContracts);
  const proposals   = useProposals(wallet.account);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((d) => {
      const next = !d;
      localStorage.setItem("equityflow_darkmode", String(next));
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const saveWorkspaceName = useCallback((name) => {
    setWorkspaceName(name);
    localStorage.setItem("equityflow_workspace", name);
  }, []);

  const refreshAll = useCallback(() => {
    contributor.refresh();
    workItems.refresh();
    dividend.refresh();
    proposals.refresh();
  }, [contributor, workItems, dividend, proposals]);

  const value = {
    darkMode, toggleDarkMode,
    workspaceName, saveWorkspaceName,
    activeTab, setActiveTab,
    wallet,
    readContracts, getSignerContracts,
    contributor,
    workItems,
    dividend,
    proposals,
    refreshAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
