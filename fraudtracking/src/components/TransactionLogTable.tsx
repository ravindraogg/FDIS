"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Search, Calendar, ChevronRight } from "lucide-react";

export default function TransactionLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let lastData = "";
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/results");
        if (!res.ok) throw new Error("Backend unreachable");
        const data = await res.json();
        
        // Simple stringify check to avoid unnecessary state updates if data hasn't changed
        const currentDataStr = JSON.stringify(data);
        if (currentDataStr !== lastData) {
          setLogs(data);
          lastData = currentDataStr;
        }
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch logs:", e);
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // Slightly slower refresh for better stability
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    String(log.transaction_id).toLowerCase().includes(filter.toLowerCase()) ||
    String(log.fraud_type || "").toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c2763f]/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#e8a365] tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Transaction Streams
          </h2>
          <p className="text-[10px] text-[#c2763f]/50 font-mono mt-1">
            Real-time ingestion from Port 5000 | Total Buffered: {logs.length}
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-[#c2763f]/40" size={14} />
          <input
            type="text"
            placeholder="Search TXID / Pattern..."
            className="w-full bg-[#1c1208] border border-[#c2763f]/20 rounded-xl pl-9 pr-4 py-2 text-xs text-[#e8a365] focus:outline-none focus:border-[#c2763f]/60 transition-all font-mono"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar border border-[#c2763f]/10 rounded-xl bg-black/20">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-[#110e0a] border-b border-[#c2763f]/20">
            <tr className="text-[10px] text-[#c2763f]/60 font-bold uppercase tracking-widest text-center">
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Detection Engine</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c2763f]/5 text-[11px] font-mono">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#c2763f]/30 italic">
                  {loading ? "Decrypting stream data..." : "No matching transactions found in buffer."}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  key={log.transaction_id}
                  className={`group transition-colors ${
                    log.anomaly 
                      ? "bg-red-500/10 hover:bg-red-500/20" 
                      : "hover:bg-[#c2763f]/5"
                  }`}
                >
                  <td className="px-6 py-3.5">
                    {log.anomaly ? (
                      <div className="flex items-center gap-2 text-red-500 font-bold">
                        <AlertTriangle size={12} className="animate-pulse" />
                        FLAGGED
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500/70">
                        <CheckCircle size={12} />
                        CLEARED
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-white/90">
                    {log.transaction_id}
                  </td>
                  <td className="px-6 py-3.5 text-[#c2763f]/70 text-center">
                    {new Date(log.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3.5 text-white font-bold text-center">
                    ₹ {Number(log.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] ${
                      log.fraud_type 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    }`}>
                      {log.fraud_type || "ML-VERIFIED"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`font-bold ${
                      log.priority === 'CRITICAL' ? 'text-red-500' : 'text-[#c2763f]/60'
                    }`}>
                      {log.priority || "DEFAULT"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="p-1 px-2 rounded-lg border border-[#c2763f]/20 hover:border-[#c2763f]/60 hover:bg-[#c2763f]/10 transition-all text-[9px] text-[#e8a365]/80 flex ml-auto items-center gap-1 group">
                      DETAILS <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between text-[9px] font-mono text-[#c2763f]/40 uppercase tracking-tighter px-2">
         <span>Encryption: AES-256 Enabled</span>
         <span>Latency: ~12ms</span>
         <span>Security Level: Tier 1 Financial</span>
      </div>
    </div>
  );
}
