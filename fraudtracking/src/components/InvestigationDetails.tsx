"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Lock,
  Flag,
  FileText,
  Activity,
  Zap,
  Route,
  ChevronRight,
  User,
  CreditCard,
  Clock,
  TrendingUp
} from "lucide-react";

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="text-[10px] tracking-widest font-semibold text-[#c2763f]/60 mb-2 uppercase">
      {label}
    </h3>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex justify-between text-[11px] py-1 border-b border-white/5">
      <span className="text-white/40">{label}</span>
      <span className={danger ? "text-red-400 font-semibold" : "text-white font-mono"}>{value}</span>
    </div>
  );
}

export default function InvestigationDetails({ data }: { data?: any }) {
  const [tab, setTab] = useState<"summary" | "behavior" | "flow" | "actions">("summary");

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div className="w-12 h-12 rounded-full bg-[#c2763f]/5 flex items-center justify-center border border-[#c2763f]/10">
          <Activity size={20} className="text-[#c2763f]/30" />
        </div>
        <div>
          <h3 className="text-[#e8a365] text-sm font-semibold tracking-wider">No Transaction Selected</h3>
          <p className="text-[11px] text-[#c2763f]/40 mt-1 uppercase tracking-tighter">
            Select a node from the intelligence map to begin investigation
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "summary", label: "Summary", icon: <ShieldAlert size={11} /> },
    { key: "behavior", label: "Behavior", icon: <Activity size={11} /> },
    { key: "flow", label: "Flow", icon: <Route size={11} /> },
    { key: "actions", label: "Actions", icon: <Zap size={11} /> },
  ] as const;

  const riskScore = data.fused_risk_score !== undefined ? data.fused_risk_score.toFixed(2) : "N/A";
  const isAnomaly = data.anomaly;
  const shortId = data.transaction_id.split("_").pop();

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} className={isAnomaly ? "text-red-500" : "text-[#e8a365]"} />
          <h2 className={`text-sm font-semibold tracking-widest ${isAnomaly ? "text-red-500" : "text-[#e8a365]"}`}>
            INVESTIGATION
          </h2>
        </div>
        <span className="text-[9px] tracking-widest text-[#c2763f]/40 font-mono">CASE #{shortId}</span>
      </div>

      {/* Risk Badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isAnomaly ? "bg-red-500/10 border-red-500/25" : "bg-emerald-500/10 border-emerald-500/25"
      }`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${isAnomaly ? "bg-red-500" : "bg-emerald-500"}`} />
        <span className={`text-[11px] font-semibold ${isAnomaly ? "text-red-400" : "text-emerald-400"}`}>
          {isAnomaly ? "Anomalous" : "Verified"} — Score: {riskScore}
        </span>
        <span className={`ml-auto text-[10px] border px-1.5 py-0.5 rounded font-bold ${
          isAnomaly ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
        }`}>
          {data.priority || "P0"}
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/3 rounded-lg p-0.5 border border-white/5">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-semibold transition
              ${tab === key
                ? "bg-[#c2763f]/25 text-[#e8a365] border border-[#c2763f]/40"
                : "text-white/30 hover:text-white/60"
              }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {tab === "summary" && (
          <div className="flex flex-col gap-3">
            <div>
              <SectionHeader label="Classification" />
              <div className="px-3 py-2 bg-[#1a1410] rounded-lg border border-[#c2763f]/15">
                <span className="text-white font-semibold text-sm">{data.fraud_type || "No specific pattern"}</span>
                {data.explanation && (
                  <p className="text-[10px] text-white/60 mt-1 leading-relaxed italic">
                    "{data.explanation}"
                  </p>
                )}
              </div>
            </div>

            <div>
              <SectionHeader label="Entity Trace" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <User size={10} className="text-[#c2763f]/50" /> 
                  <span className="opacity-50">Sender:</span> 
                  <span className="font-mono">{data.sender_acc || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/70">
                  <CreditCard size={10} className="text-[#c2763f]/50" /> 
                  <span className="opacity-50">Receiver:</span> 
                  <span className="font-mono">{data.receiver_acc || "Unknown"}</span>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader label="Basic Data" />
              <Row label="Amount" value={`₹ ${Number(data.amount).toLocaleString()}`} danger={data.amount > 50000} />
              <Row label="Time" value={new Date(data.timestamp * 1000).toLocaleString()} />
            </div>
          </div>
        )}

        {tab === "behavior" && (
          <div className="flex flex-col gap-3">
            <SectionHeader label="Feature Analysis" />
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/3 p-2 rounded border border-white/5">
                <span className="text-[9px] text-white/30 uppercase block">Amt Dev</span>
                <span className="text-xs text-white font-mono">{data.amount_deviation?.toFixed(1) || 0}×</span>
              </div>
              <div className="bg-white/3 p-2 rounded border border-white/5">
                <span className="text-[9px] text-white/30 uppercase block">Tx Freq</span>
                <span className="text-xs text-white font-mono">{data.tx_freq || 0}</span>
              </div>
            </div>
            
            <SectionHeader label="Risk Indicators" />
            <Row label="Unusual Timing" value={data.unusual_timing ? "Yes" : "No"} danger={data.unusual_timing} />
            <Row label="Velocity Alert" value={data.tx_velocity > 50000 ? "High" : "Normal"} danger={data.tx_velocity > 50000} />

            <div className="mt-2 text-[11px] text-[#e8a365] bg-[#c2763f]/10 p-2.5 rounded-lg border border-[#c2763f]/20 flex items-start gap-2">
              <TrendingUp size={12} className="shrink-0 mt-0.5" />
              <span>
                {isAnomaly 
                  ? "ML Engine detected multidimensional outliers in behavioral patterns." 
                  : "All behavioral features within 2-sigma of historical baseline."}
              </span>
            </div>
          </div>
        )}

        {tab === "flow" && (
          <div className="flex flex-col gap-3">
            <SectionHeader label="Graph Intelligence" />
            <Row label="Hop Count" value={data.hop_count || "1"} />
            <Row label="Cycle Detected" value={data.cycle_detected ? "YES" : "No"} danger={data.cycle_detected} />
            <Row label="Network Density" value={(data.unique_connected || 0).toString()} />
            
            <SectionHeader label="Structural View" />
            <div className="text-[10px] font-mono bg-black/40 px-3 py-3 rounded border border-white/10 text-white leading-relaxed">
              <span className="text-[#c2763f]/60">PATH_TRACE:</span><br />
              {data.sender_acc} → {data.receiver_acc}<br />
              {data.cycle_detected && (
                <span className="text-red-400 mt-1 block">
                   ⚠ CYCLIC RECURSION DETECTED (LAYERING)
                </span>
              )}
            </div>
          </div>
        )}

        {tab === "actions" && (
          <div className="flex flex-col gap-2">
            <SectionHeader label="Recommended Actions" />
            {isAnomaly ? (
              <>
                <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 py-2 rounded-lg transition flex justify-center items-center gap-2 text-[11px] font-semibold shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                  <Lock size={12} /> Freeze Account {data.sender_acc}
                </button>
                <button className="w-full bg-[#c2763f]/10 hover:bg-[#c2763f]/20 text-[#e8a365] border border-[#c2763f]/30 py-2 rounded-lg transition flex justify-center items-center gap-2 text-[11px]">
                  <Flag size={12} /> Flag Cluster for Review
                </button>
              </>
            ) : (
              <button className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg transition flex justify-center items-center gap-2 text-[11px]">
                <ShieldAlert size={12} /> Mark as Safe
              </button>
            )}
            <button className="w-full bg-white/4 hover:bg-white/8 text-white/60 border border-white/10 py-2 rounded-lg transition flex justify-center items-center gap-2 text-[11px]">
              <FileText size={12} /> Generate SAR Report
            </button>
            <p className="text-[9px] text-white/20 text-center mt-2 font-mono">
              GATEWAY_ID: {data.id || "INTERNAL_" + shortId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}