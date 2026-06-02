import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useApp } from "../../context/AppContext";

const AppShell = ({ children }) => {
  const { activeTab } = useApp();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
