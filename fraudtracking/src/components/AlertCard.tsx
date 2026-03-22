"use client";

import React from "react";
import { Clock, Activity } from "lucide-react";

export interface Alert {
    id: string;
    priority: "P1" | "P2" | "P3";
    title: string;
    amount: string;
    time: string;
    node: string;
}

interface AlertCardProps {
    alert: Alert;
    selected?: boolean;
    onClick?: () => void;
}

export default function AlertCard({ alert, selected, onClick }: AlertCardProps) {
    const priorityStyle =
        alert.priority === "P1"
            ? "bg-red-500/20 text-red-500 border border-red-500/50"
            : alert.priority === "P2"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/50";

    return (
        <div
            onClick={onClick}
            className={`rounded-xl p-3 cursor-pointer transition group
        ${selected
                    ? "bg-[#c2763f]/15 border border-[#c2763f]/60 shadow-[0_0_12px_rgba(194,118,63,0.25)]"
                    : "bg-[#1a1410]/80 border border-[#c2763f]/15 hover:border-[#c2763f]/50 hover:shadow-[0_0_10px_rgba(194,118,63,0.15)]"
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityStyle}`}>
                    {alert.priority}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-[#c2763f]/50">
                    <Activity size={10} />
                    {alert.node}
                </div>
            </div>
            <h3 className="text-xs font-semibold text-white group-hover:text-[#e8a365] transition leading-snug">
                {alert.title}
            </h3>
            <div className="flex items-center justify-between mt-2 text-[10px] text-white/50">
                <span className="text-green-400/80">{alert.amount}</span>
                <span className="flex items-center gap-0.5">
                    <Clock size={9} /> {alert.time}
                </span>
            </div>
        </div>
    );
}