import { useState } from "react";
import { Search, Globe, Plus, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import UMLogo from "@/components/UMLogo";

/* ── Mock Data ── */
const STORIES = [
  { id: 0, name: "Your story", img: "/placeholder.svg", isUser: true },
  { id: 1, name: "mugungapacific", img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "faradja_sn", img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "eddy.rutajoga", img: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "sarah_j", img: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "alex_m", img: "https://i.pravatar.cc/150?u=5" },
];

const ORBIT_USERS = [
  /* Inner Circle */
  { id: 1, img: "https://i.pravatar.cc/150?u=10", angle: 0, size: 40, tier: "inner" },
  { id: 2, img: "https://i.pravatar.cc/150?u=11", angle: 60, size: 36, tier: "inner" },
  { id: 3, img: "https://i.pravatar.cc/150?u=12", angle: 120, size: 40, tier: "inner" },
  { id: 4, img: "https://i.pravatar.cc/150?u=13", angle: 180, size: 36, tier: "inner" },
  { id: 5, img: "https://i.pravatar.cc/150?u=14", angle: 240, size: 40, tier: "inner" },
  { id: 6, img: "https://i.pravatar.cc/150?u=15", angle: 300, size: 36, tier: "inner" },
  /* Middle Circle */
  { id: 7, img: "https://i.pravatar.cc/150?u=20", angle: 30, size: 30, tier: "mid" },
  { id: 8, img: "https://i.pravatar.cc/150?u=21", angle: 90, size: 28, tier: "mid" },
  { id: 9, img: "https://i.pravatar.cc/150?u=22", angle: 150, size: 30, tier: "mid" },
  { id: 10, img: "https://i.pravatar.cc/150?u=23", angle: 210, size: 28, tier: "mid" },
  { id: 11, img: "https://i.pravatar.cc/150?u=24", angle: 270, size: 30, tier: "mid" },
  { id: 12, img: "https://i.pravatar.cc/150?u=25", angle: 330, size: 28, tier: "mid" },
  /* Outer Circle */
  { id: 13, img: "https://i.pravatar.cc/150?u=30", angle: 15, size: 24, tier: "outer" },
  { id: 14, img: "https://i.pravatar.cc/150?u=31", angle: 75, size: 22, tier: "outer" },
  { id: 15, img: "https://i.pravatar.cc/150?u=32", angle: 135, size: 24, tier: "outer" },
  { id: 16, img: "https://i.pravatar.cc/150?u=33", angle: 195, size: 22, tier: "outer" },
  { id: 17, img: "https://i.pravatar.cc/150?u=34", angle: 255, size: 24, tier: "outer" },
  { id: 18, img: "https://i.pravatar.cc/150?u=35", angle: 315, size: 22, tier: "outer" },
];

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=150&h=150&fit=crop",
];

/* ── Component ── */
const HomeScreen = () => {
  const [pulsing, setPulsing] = useState(false);

  const handlePulse = () => {
    setPulsing(true);
    setTimeout(() => setPulsing(false), 2000);
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(28,90%,55%) 0%, hsl(28,85%,65%) 40%, hsl(168,55%,50%) 100%)" }}
    >

      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1 relative z-20 shrink-0">
        <div className="w-8" />
        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">uniMate</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <Search size={22} className="text-white drop-shadow-sm" />
        </button>
      </div>

      {/* ═══════════ STORIES ═══════════ */}
      <div className="mt-2 overflow-x-auto scrollbar-hide px-4 z-20 shrink-0 pb-2">
        <div className="flex gap-3.5 min-w-max">
          {STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1.5 w-[68px] cursor-pointer active:opacity-80 transition-opacity">
              <div className="relative w-[68px] h-[68px]">
                <div className={`w-full h-full rounded-full p-[2px] ${story.isUser ? "bg-transparent" : "bg-gradient-to-tr from-[hsl(28,90%,55%)] to-[hsl(168,55%,45%)]"}`}>
                  <div className="w-full h-full rounded-full border-[2.5px] border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm">
                    {story.isUser ? (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <img src="https://github.com/shadcn.png" alt="You" className="w-full h-full object-cover opacity-90" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Plus size={12} className="text-blue-500" />
                        </div>
                      </div>
                    ) : (
                      <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-white font-medium truncate w-full text-center drop-shadow-sm">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ ORBIT (The Main Content) ═══════════ */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
        {/* Rings */}
        <div className="absolute w-[85%] aspect-square rounded-full border border-white/15" />
        <div className="absolute w-[58%] aspect-square rounded-full border border-white/20" />
        <div className="absolute w-[32%] aspect-square rounded-full border border-white/25" />

        {/* Pulse */}
        {pulsing && (
          <>
            <div className="absolute w-[32%] aspect-square rounded-full border-2 border-white/60 animate-ping" />
            <div className="absolute w-[58%] aspect-square rounded-full border border-white/40 animate-ping delay-100" />
          </>
        )}

        {/* Center */}
        <div
          onClick={handlePulse}
          className="relative z-30 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/10 flex items-center justify-center border-2 border-white">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <UMLogo size={60} />
            </div>

            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Globe size={11} className="text-white" />
              <span className="text-[10px] font-bold text-white">Global</span>
            </div>
          </div>
        </div>

        {/* Users */}
        {ORBIT_USERS.map((user) => {
          // Dynamic radius sizing based on viewport percentage approx
          const radiusPct = user.tier === "inner" ? 16 : user.tier === "mid" ? 29 : 42.5;
          const rad = (user.angle * Math.PI) / 180;

          return (
            <div
              key={user.id}
              className="absolute z-20"
              style={{
                left: `calc(50% + ${Math.cos(rad) * radiusPct}vw - ${user.size / 2}px)`,
                top: `calc(50% + ${Math.sin(rad) * radiusPct}vw - ${user.size / 2}px)`,

                // Fallback for desktop using pixels if vw gets too large
                transform: `translate(${Math.cos(rad) * (user.tier === "inner" ? 60 : user.tier === "mid" ? 110 : 160)}px, ${Math.sin(rad) * (user.tier === "inner" ? 60 : user.tier === "mid" ? 110 : 160)}px)`,
              }}
            >
              {/* Reset transform for mobile via CSS media query override handled by absolute positioning logic if needed, 
                  but here we use simple pixel fallback logic in style. Actually, let's keep it simple with pixel offsets for constraints.
              */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  top: "50%",
                  marginLeft: `${Math.cos(rad) * (user.tier === "inner" ? 65 : user.tier === "mid" ? 115 : 165)}px`,
                  marginTop: `${Math.sin(rad) * (user.tier === "inner" ? 65 : user.tier === "mid" ? 115 : 165)}px`,
                  width: user.size,
                  height: user.size
                }}
              >
                <div className="w-full h-full rounded-full border-2 border-white shadow-sm overflow-hidden relative">
                  <img src={user.img} alt="User" className="w-full h-full object-cover" />
                  {user.id % 5 === 0 && (
                    <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                      <Star size={8} className="text-white fill-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════ TOP 5 (Clean & Small) ═══════════ */}
      <div className="flex flex-col items-center mb-24 z-20 shrink-0">
        <h2 className="text-white font-bold text-sm mb-2 opacity-90 tracking-wide uppercase text-[10px]">Top 5 Draft</h2>
        <div className="flex gap-5 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/10">
          {ROOM_IMAGES.map((img, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-full border-2 border-white/60 bg-white/20 overflow-hidden shadow-sm active:scale-95 transition-transform"
            >
              <img src={img} alt={`Room ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav className="bg-transparent border-none text-white pb-6" variant="light" />
    </div>
  );
};

export default HomeScreen;
