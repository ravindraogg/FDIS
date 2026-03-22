"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import KPIBar from "@/components/KPICards";
import TransactionGraph from "@/components/TransactionGraph";
import AlertsPanel from "@/components/AlertsPanel";
import InvestigationDetails from "@/components/InvestigationDetails";
import TransactionLogTable from "@/components/TransactionLogTable";

const glassPanel =
  "bg-[#110e0a]/80 backdrop-blur-md border border-[#c2763f]/25 rounded-2xl shadow-[0_0_18px_rgba(194,118,63,0.08)]";

export default function FraudDashboard() {
  const [selectedNode, setSelectedNode] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState("OVERVIEW");

  return (
    <div className="min-h-screen bg-[#070503] text-gray-300 font-sans flex flex-col overflow-y-auto selection:bg-orange-500/30 custom-scrollbar relative">

      {/* ── Ambient background ───────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(#c2763f 1px, transparent 1px)",
          backgroundSize: "100% 44px",
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(194,118,63,0.03)_0%,transparent_80%)]" />

      {/* ── Navbar ───────────────────────────────────────────── */}
      <div className="mx-6 mt-6 mb-4">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex flex-col gap-6 px-6 pb-12 relative z-10">
        {activeTab === "OVERVIEW" ? (
          <>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* ── Left/Center: Transaction Graph ─────────────────────────── */}
              <div className={`flex-1 flex items-center justify-center min-h-[440px] ${glassPanel} overflow-hidden`}>
                <TransactionGraph onNodeClick={setSelectedNode} selectedNodeId={selectedNode?.transaction_id?.split("_").pop() || selectedNode?.transaction_id} />
              </div>

              {/* ── Right: KPI Bar ──────────────────────────────────────────── */}
              <aside className={`w-full lg:w-72 ${glassPanel} flex flex-col h-[440px]`}>
                <KPIBar />
              </aside>
            </div>

            {/* ── Bottom Row: Alerts | Investigation ───────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
              {/* Left: Alerts */}
              <div className={`${glassPanel} p-5 min-h-[400px]`}>
                <AlertsPanel />
              </div>

              {/* Right: Investigation Details */}
              <div className={`${glassPanel} p-5 min-h-[400px]`}>
                <InvestigationDetails data={selectedNode} />
              </div>
            </div>
          </>
        ) : activeTab === "TRANSACTIONS" ? (
          <div className={`${glassPanel} p-6 min-h-[700px]`}>
            <TransactionLogTable />
          </div>
        ) : (
          <div className={`${glassPanel} p-12 flex items-center justify-center text-[#c2763f]/40 italic`}>
            Module Coming Soon...
          </div>
        )}
      </main>
    </div>
  );
}