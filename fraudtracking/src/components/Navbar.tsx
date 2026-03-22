"use client";

import React from "react";
import { ShieldAlert, Bell, Settings, User, Wifi } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const cardStyle = "bg-[#110e0a]/50 backdrop-blur-md border border-[#c2763f]/25 rounded-2xl px-5 py-2.5 flex items-center shadow-[0_0_15px_rgba(194,118,63,0.05)]";

  return (
    <nav className="flex items-center justify-between w-full z-20 relative gap-4">
      {/* Card 1: Logo / Brand */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setActiveTab("OVERVIEW")}>
          <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">Bank</span>
          <span className="text-[#c2763f] text-xs font-medium opacity-60">NAME</span>
        </div>
      </div>

      {/* Card 2: Nav Links */}
      <div className={`${cardStyle} hidden md:flex gap-8 text-[11px] tracking-[0.15em] text-[#c2763f]/60 font-bold`}>
        {["OVERVIEW", "TRANSACTIONS", "REPORTS"].map((item, i) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`hover:text-[#e8a365] transition-all duration-300 relative group ${activeTab === item ? "text-[#e8a365]" : ""}`}
          >
            {item}
            <motion.div 
              className={`absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#c2763f] origin-left ${activeTab === item ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"} transition-transform duration-300`}
            />
          </button>
        ))}
      </div>

      {/* Card 3: Right Actions (Transparent) */}
      <div className="flex items-center gap-4 bg-transparent">
        <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:border-[#c2763f]/40 hover:bg-[#c2763f]/5 transition-all duration-300 group">
          <Settings size={16} className="text-[#c2763f]/60 group-hover:text-[#e8a365] transition-colors" />
        </button>
        <div className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:border-[#c2763f]/40 hover:bg-[#c2763f]/5 transition-all duration-300 group">
          <div className="w-8 h-8 rounded-xl bg-[#c2763f]/20 flex items-center justify-center border border-[#c2763f]/30">
            <User size={14} className="text-[#e8a365]" />
          </div>
          <div className="flex flex-col items-start leading-none hidden sm:flex">
            <span className="text-[10px] text-[#e8a365] font-bold tracking-wider">ANALYST</span>
            <span className="text-[9px] text-[#c2763f]/50 font-medium mt-0.5">ONLINE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}