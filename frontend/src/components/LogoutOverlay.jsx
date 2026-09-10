import React, { useEffect, useState } from "react";
import { LogOut, CheckCircle } from "lucide-react";

export default function LogoutOverlay({ onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → visible → exit

  useEffect(() => {
    // Phase 1: animate in
    const t1 = setTimeout(() => setPhase("visible"), 50);
    // Phase 2: start exit after 1.6s
    const t2 = setTimeout(() => setPhase("exit"), 1700);
    // Phase 3: call onDone after exit animation
    const t3 = setTimeout(() => onDone?.(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        transition: "opacity 0.35s ease",
        opacity: phase === "exit" ? 0 : phase === "visible" ? 1 : 0,
        pointerEvents: "all",
      }}
    >
      {/* Card */}
      <div
        style={{
          transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.35s ease",
          transform: phase === "exit"
            ? "scale(0.88) translateY(20px)"
            : phase === "visible"
            ? "scale(1) translateY(0)"
            : "scale(0.88) translateY(20px)",
          opacity: phase === "exit" ? 0 : phase === "visible" ? 1 : 0,
        }}
        className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-4 min-w-[280px]"
      >
        {/* Animated icon */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring */}
          <span className="absolute inline-flex h-20 w-20 rounded-full bg-orange-100 animate-ping opacity-40" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <LogOut className="h-9 w-9 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h3 className="font-display text-xl font-bold text-gray-900">
            Logging you out…
          </h3>
          <p className="text-sm text-gray-500">
            Stay safe, Barangay 178!
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            style={{
              animation: "logout-progress 1.7s ease forwards",
            }}
          />
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes logout-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
