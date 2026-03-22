"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, BellRing } from "lucide-react";
import AlertCard, { type Alert } from "./AlertCard";

const ALERTS: Alert[] = [
  { id: "1", priority: "P1", title: "Layering Detected", amount: "₹ 3,60,000", time: "12:40 PM", node: "A123" },
  { id: "2", priority: "P1", title: "Smurfing Detected", amount: "₹ 90,000", time: "12:35 PM", node: "E987" },
  { id: "3", priority: "P2", title: "High Risk Pattern", amount: "₹ 1,50,000", time: "12:35 PM", node: "G321" },
  { id: "4", priority: "P2", title: "Rapid Velocity Spike", amount: "₹ 80,000", time: "12:28 PM", node: "B456" },
  { id: "5", priority: "P3", title: "Unusual Hour Activity", amount: "₹ 22,000", time: "12:20 PM", node: "X100" },
];

export default function AlertsPanel() {
  const [selected, setSelected] = useState<string | null>("1");
  const [query, setQuery] = useState("");
  const [realAlerts, setRealAlerts] = useState<Alert[]>(ALERTS);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/results");
        const data = await res.json();
        
        if (data && data.length > 0) {
          const anomalies = data
            .filter((tx: any) => tx.anomaly)
            .map((tx: any, idx: number) => ({
              id: tx.transaction_id,
              priority: tx.priority === 'CRITICAL' ? 'P1' : 'P2',
              title: tx.fraud_type || "Suspicious Activity",
              amount: `₹ ${tx.amount || '0'}`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              node: tx.transaction_id.split('_').pop() || tx.transaction_id
            }));
          
          if (anomalies.length > 0) setRealAlerts(anomalies);
        }
      } catch (e) {
        console.error("Failed to fetch alerts", e);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const filtered = realAlerts.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.node.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing size={14} className="text-[#e8a365]" />
          <h2 className="text-sm font-semibold text-[#e8a365] tracking-widest uppercase">Live Alerts</h2>
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
            {realAlerts.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[9px] text-red-500/70 font-bold uppercase tracking-tighter">Monitoring</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2 text-[#c2763f]/40" size={13} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alerts…"
          className="w-full bg-[#1a1410] border border-[#c2763f]/20 rounded-lg pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:border-[#c2763f]/60 text-[#e8a365] placeholder-[#c2763f]/25"
        />
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5 custom-scrollbar">
        {filtered.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            selected={selected === alert.id}
            onClick={() => setSelected(alert.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-[11px] text-white/20 text-center mt-4 italic">No alerts detected in current stream window.</p>
        )}
      </div>

      {/* Footer */}
      <button className="w-full py-2 border border-[#c2763f]/20 rounded-lg text-[10px] tracking-widest text-[#e8a365]/70 hover:bg-[#c2763f]/10 transition-all duration-300">
        BROADCAST LIVE THREAD
      </button>
    </div>
  );
}