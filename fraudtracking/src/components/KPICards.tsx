"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const kpis = [
  {
    label: "TOTAL TRANSACTIONS",
    value: "12,460",
    sub: "+2.4% today",
    trend: "up",
    color: "text-white",
  },
  {
    label: "TOTAL AMOUNT",
    value: "₹ 1,24,600.00",
    sub: "Across all flows",
    trend: "up",
    color: "text-white",
  },
  {
    label: "FLAGGED",
    value: "34",
    sub: "Awaiting review",
    trend: "down",
    color: "text-red-400",
  },
  {
    label: "RISK SCORE",
    value: "P1",
    sub: "Critical threshold",
    trend: "down",
    color: "text-red-500",
    icon: <AlertTriangle size={14} className="inline ml-1" />,
  },
  {
    label: "CASES OPENED",
    value: "5",
    sub: "Active cases",
    trend: "up",
    color: "text-[#e8a365]",
    icon: <ChevronDown size={14} className="inline" />,
  },
  {
    label: "TX FAULTS",
    value: "12",
    sub: "Structural anomalies",
    trend: "down",
    color: "text-[#e8a365]",
  },
  {
    label: "DENIED",
    value: "8",
    sub: "Auto-blocked",
    trend: "down",
    color: "text-red-400",
  },
];

function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: { value: any, prefix?: string, suffix?: string, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') {
       // If it's a string from legacy backend or placeholder, try to parse or just show
       if (!isNaN(parseFloat(value))) {
         animateValue(parseFloat(value));
       }
       return;
    }
    animateValue(value);
  }, [value]);

  const animateValue = (target: number) => {
    let start = displayValue;
    const duration = 1000; // 1s
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease = 1 - (1 - progress) * (1 - progress);
      const current = start + (target - start) * ease;
      
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  if (value === "---" || value === null || value === undefined) return <span>---</span>;

  return (
    <span>
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

export default function KPIBar() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/stats");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const kpiData = [
    {
      label: "TOTAL TRANSACTIONS",
      value: stats?.totalTransactions ?? "---",
      sub: "+2.4% today",
      trend: "up",
      color: "text-white",
    },
    {
      label: "TOTAL AMOUNT",
      value: stats?.totalAmount ?? "---",
      prefix: "₹ ",
      decimals: 2,
      sub: "Across all flows",
      trend: "up",
      color: "text-white",
    },
    {
      label: "FLAGGED",
      value: stats?.flaggedCount ?? "---",
      sub: "Awaiting review",
      trend: "down",
      color: "text-red-400",
    },
    {
      label: "RISK SCORE",
      value: stats?.avgRiskScore ?? "---",
      decimals: 1,
      sub: "Critical threshold",
      trend: "down",
      color: "text-red-500",
      icon: <AlertTriangle size={14} className="inline ml-1" />,
    },
    {
      label: "CASES OPENED",
      value: stats?.activeCases ?? "---",
      sub: "Active cases",
      trend: "up",
      color: "text-[#e8a365]",
      icon: <ChevronDown size={14} className="inline" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="text-[10px] tracking-[0.2em] text-[#c2763f]/40 font-bold uppercase">
          Live Metrics
        </div>
        <div className="flex items-center gap-1.5">
           <div className={`w-1.5 h-1.5 rounded-full ${stats ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
           <span className={`text-[8px] font-bold ${stats ? 'text-green-500/70' : 'text-red-500/70'} uppercase`}>
             {stats ? 'Stream Active' : 'Offline'}
           </span>
        </div>
      </div>
      {kpiData.map((kpi, i) => (
        <motion.div
  key={kpi.label}
  className="bg-[#110e0a]/40 backdrop-blur-sm border border-[#c2763f]/10 rounded-xl p-3 cursor-default group hover:bg-[#c2763f]/5 hover:border-[#c2763f]/30 transition-all duration-300"
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: i * 0.05 }}
>
  <div className="flex justify-between items-start mb-1">
    <span className="text-[9px] tracking-widest text-[#c2763f]/60 font-bold uppercase group-hover:text-[#c2763f] transition-colors">
      {kpi.label}
    </span>
    {kpi.trend === "up" ? (
      <TrendingUp size={10} className="text-green-500/50 transition-transform group-hover:scale-125" />
    ) : (
      <TrendingDown size={10} className="text-red-500/50 transition-transform group-hover:scale-125" />
    )}
  </div>
  
  <div className="flex items-baseline justify-between">
    <span className={`text-base font-bold ${kpi.color} tracking-tight font-mono`}>
      <CountUp 
        value={kpi.value} 
        prefix={(kpi as any).prefix} 
        suffix={(kpi as any).suffix} 
        decimals={(kpi as any).decimals} 
      />
      {(kpi as any).icon}
    </span>
    <span className="text-[9px] text-white/20 font-medium">{kpi.sub}</span>
  </div>

  <div className="w-full h-[1px] bg-[#c2763f]/5 mt-2 overflow-hidden">
    <motion.div 
      className={`h-full ${kpi.color.includes('red') ? 'bg-red-500/40' : 'bg-[#c2763f]/40'}`}
      initial={{ width: 0 }}
      animate={{ width: stats ? "100%" : "0%" }}
      transition={{ duration: 1 }}
    />
  </div>
</motion.div>
      ))}
    </div>
  );
}