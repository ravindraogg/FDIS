"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export type NodeType = "Normal" | "P1" | "P2" | "Current";

export interface TxNode {
  id: string;
  cx: number;
  cy: number;
  type: NodeType;
  amount: string;
  label: string;
  originalData?: any;
}

// ── SVG canvas constants ─────────────────────────────────────────────────────
const SVG_H = 340;   
const CENTRE_Y = 170;   
const BRANCH_UP = 55;   
const BRANCH_DOWN = 280;   
const NODE_SPACING = 220;  

function nodeColor(type: NodeType) {
  if (type === "P1") return "#ef4444";
  if (type === "P2") return "#f59e0b";
  if (type === "Current") return "#ffffff";
  return "#c2763f";
}

function NodeTooltip({ node }: { node: TxNode }) {
  const timeStr = node.originalData?.timestamp 
    ? new Date(node.originalData.timestamp * 1000).toLocaleTimeString() 
    : "12:38:44 PM";

  return (
    <div className="bg-[#12100d]/95 backdrop-blur border border-[#c2763f]/50 p-4 rounded-xl shadow-[0_0_24px_rgba(194,118,63,0.35)] w-56 pointer-events-none">
      <div className="flex justify-between items-start mb-2">
        <span className="text-white font-bold text-sm">{node.id}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${node.type === "P1" ? "bg-red-500/20 text-red-400 border-red-500/40" :
            node.type === "P2" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
              node.type === "Current" ? "bg-white/10 text-white border-white/20" :
                "bg-[#c2763f]/20 text-[#c2763f] border-[#c2763f]/30"
            }`}
        >
          {node.type}
        </span>
      </div>
      <div className="text-[11px] text-[#c2763f]/70 mb-3">{node.label}</div>
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="opacity-50">Amount</span>
          <span className="text-white font-mono">{node.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-50">Timestamp</span>
          <span className="text-white font-mono">{timeStr}</span>
        </div>
        {node.type !== "Normal" && node.type !== "Current" && (
          <div className="pt-2 mt-1 border-t border-red-500/20 text-red-400 text-[10px] flex items-center gap-1">
            <AlertTriangle size={10} /> Abnormal Flow Detected
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionGraph({ onNodeClick, selectedNodeId }: { onNodeClick?: (node: any) => void; selectedNodeId?: string }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [realNodes, setRealNodes] = useState<TxNode[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/results");
        if (!res.ok) throw new Error("Backend unreachable");
        const data = await res.json();

        if (data && data.length > 0) {
          const contentWidth = data.length * NODE_SPACING + 200;

          const updated = data.map((realTx: any, idx: number) => {
            const pStr = String(realTx.priority || "").toUpperCase();
            const isCritical = pStr === "CRITICAL" || pStr.includes("P4") || pStr.includes("P6");
            const type: NodeType = realTx.anomaly 
              ? (isCritical ? "P1" : "P2") 
              : "Normal";

            const cy =
              type === "Normal" ? CENTRE_Y :
                type === "P1" ? BRANCH_DOWN :
                  BRANCH_UP;

            // Ensure amount is handled correctly
            const rawAmount = realTx.amount || realTx.originalData?.amount || 0;
            const formattedAmount = `₹ ${Number(rawAmount).toLocaleString()}`;

            return {
              id: realTx.transaction_id.split("_").pop() || realTx.transaction_id,
              cx: contentWidth - 100 - idx * NODE_SPACING,
              cy,
              type,
              amount: formattedAmount,
              label: realTx.fraud_type || (realTx.anomaly ? "Risk Detected" : "Verified"),
              originalData: realTx,
            };
          });

          setRealNodes(updated);
        }
      } catch (e) {
        console.error("Failed to fetch results from backend:", e);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 2000);
    return () => clearInterval(interval);
  }, []);

  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isAtEnd = scrollWidth - (scrollLeft + clientWidth) < 150;
    if (isAtEnd || realNodes.length <= 10) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: realNodes.length <= 10 ? "auto" : "smooth",
      });
    }
  }, [realNodes]);

  const filteredNodes = realNodes.filter(node => {
    if (!filterDate) return true;
    const txDate = node.originalData?.timestamp || "";
    return String(txDate).includes(filterDate);
  });

  const getHoveredNodeData = () => filteredNodes.find((n) => n.id === hoveredNode) ?? null;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredNode) setMousePos({ x: e.clientX, y: e.clientY });
  };

  const svgWidth = filteredNodes.length * NODE_SPACING + 200;

  return (
    <div
      className="relative flex flex-col w-full h-full"
      onMouseMove={handleMouseMove}
    >
      {realNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-32 w-full bg-[#110e0a]/40 backdrop-blur-md rounded-3xl border border-[#c2763f]/15 shadow-inner">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#c2763f]/10 border-t-[#c2763f] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[#e8a365] font-bold text-sm tracking-[0.4em] uppercase animate-pulse">
              Establishing Kafka Handshake
            </p>
            <p className="text-[#c2763f]/40 text-[10px] font-mono italic px-12">
              Waiting for backend ingestion on Port 5000...
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <div
            className="relative w-full"
            style={{
              borderRadius: "32px",
              background: "linear-gradient(160deg, #1c1208 0%, #0a0805 60%, #150f06 100%)",
              border: "2.5px solid rgba(194,118,63,0.25)",
              boxShadow: "0 0 60px rgba(194,118,63,0.08), inset 0 0 80px rgba(0,0,0,0.8), 0 2px 0 rgba(255,200,100,0.04)",
              padding: "20px 0 16px",
            }}
          >
            <div className="flex justify-between items-center mb-3 px-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#c2763f]/50 tracking-widest uppercase">
                  Stream Window
                </span>
                <input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-[#1c1208] border border-[#c2763f]/20 rounded px-2 py-0.5 text-[10px] text-[#c2763f]/70 font-mono focus:outline-none focus:border-[#c2763f]/50"
                />
              </div>
              <span className="text-[10px] font-mono text-[#c2763f]/80 tracking-widest font-bold uppercase text-center flex-1">
                Real-Time Intelligence Map
              </span>
              <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-amber-500/70 tracking-widest font-bold">
                      ACTIVE NODES: {filteredNodes.length}
                  </span>
                  <span className="text-[10px] font-mono text-red-500/70 tracking-widest font-bold animate-pulse">
                      SYNCED
                  </span>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="w-full overflow-x-auto pb-2"
              style={{ scrollBehavior: "smooth" }}
            >
              <svg
                width={svgWidth}
                height={SVG_H}
                viewBox={`0 0 ${svgWidth} ${SVG_H}`}
                className="block"
              >
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(194,118,63,0.06)" strokeWidth="1" />
                  </pattern>
                  <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="7" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <rect width={svgWidth} height={SVG_H} fill="url(#grid)" />

                <motion.line
                  x1="0" y1={CENTRE_Y}
                  x2={svgWidth} y2={CENTRE_Y}
                  stroke="rgba(194,118,63,0.15)"
                  strokeWidth="2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />

                {filteredNodes.map((node) => {
                  if (node.type === "Normal") return null;
                  const startX = node.cx - 100;
                  const endX = node.cx;
                  const labelY =
                    node.type === "P1"
                      ? node.cy - 16
                      : node.cy + 22;
                  return (
                    <g key={`path-${node.id}`}>
                      <motion.path
                        d={`M ${startX} ${CENTRE_Y} C ${startX + 60} ${CENTRE_Y}, ${endX - 60} ${node.cy}, ${endX} ${node.cy}`}
                        stroke={node.type === "P1" ? "rgba(239,68,68,0.4)" : "rgba(245,158,11,0.4)"}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={node.type === "P2" ? "5 5" : undefined}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                      />
                      <text
                        x={node.cx - 40}
                        y={labelY}
                        fill={node.type === "P1" ? "#ef4444" : "#f59e0b"}
                        fontSize="9"
                        fontFamily="monospace"
                        opacity={0.4}
                      >
                        {node.type === "P1" ? "ANOMALY" : "HIGH RISK"}
                      </text>
                    </g>
                  );
                })}

                {filteredNodes.map((node, i) => {
                  const isHovered = hoveredNode === node.id;
                  const isSelected = selectedNodeId === node.id;
                  const col = nodeColor(node.type);
                  const filterId = node.type === "P1" ? "glow-red" : "glow-amber";
                  return (
                    <g
                      key={node.id + i}
                      onMouseEnter={(e) => {
                        setHoveredNode(node.id);
                        setMousePos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => onNodeClick?.(node.originalData)}
                      className="cursor-pointer"
                    >
                      {isSelected && (
                        <circle
                          cx={node.cx} cy={node.cy} r={22}
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      )}

                      {(node.type === "P1" || node.type === "P2") && (
                        <motion.circle
                          cx={node.cx} cy={node.cy}
                          initial={{ r: 18, opacity: 0.6 }}
                          animate={{ r: [18, 28, 18], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          fill="none"
                          stroke={col}
                          strokeWidth="1.5"
                        />
                      )}

                      <motion.circle
                        cx={node.cx} cy={node.cy}
                        initial={{ r: 14 }}
                        animate={{ scale: isHovered ? 1.3 : 1 }}
                        style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                        r={14}
                        fill="rgba(0,0,0,0.8)"
                        stroke={col}
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter={`url(#${filterId})`}
                      />

                      <circle cx={node.cx} cy={node.cy} r={5} fill={col} filter={`url(#${filterId})`} />

                      <text
                        x={node.cx} y={node.cy - 22}
                        textAnchor="middle"
                        fill={col}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {node.id}
                      </text>

                      <text
                        x={node.cx} y={node.cy + 34}
                        textAnchor="middle"
                        fill={isSelected ? "#ffffff" : col}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        opacity={isSelected ? 1 : 1}
                        style={{ textShadow: "0 0 4px rgba(0,0,0,1)" }}
                      >
                        {node.amount}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between items-center mt-2 px-6">
              <span className="text-[9px] font-mono text-[#c2763f]/30">
                SYNCING AGENT: NODE_GATEWAY v1.0.4
              </span>
              <span className="text-[9px] font-mono text-[#c2763f]/50 uppercase tracking-[0.2em]">
                 Scroll to explore past events | Click node to investigate
              </span>
              <span className="text-[9px] font-mono text-[#c2763f]/30 lowercase">
                packet_loss: 0.00%
              </span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {hoveredNode && getHoveredNodeData() && (
          <motion.div
            key={hoveredNode}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              left: Math.min(window.innerWidth - 250, mousePos.x + 20),
              top: Math.min(window.innerHeight - 220, mousePos.y - 120),
            }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] pointer-events-none"
          >
            <NodeTooltip node={getHoveredNodeData()!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}