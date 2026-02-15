import { Home, Globe, MessageCircle, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Globe, label: "Explore", path: "/explore" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Bell, label: "Activity", path: "/activity" },
  { icon: User, label: "Profile", path: "/profile" },
];

interface BottomNavProps {
  className?: string;
  variant?: "default" | "light";
}

const BottomNav = ({ className = "", variant = "default" }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLight = variant === "light";
  const activeColor = isLight ? "text-white" : "text-primary";
  const inactiveColor = isLight ? "text-white/60 hover:text-white/80" : "text-muted-foreground hover:text-foreground";

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 px-2 pb-6 pt-2 transition-all duration-300 ${isLight ? "bg-transparent border-t-0" : "bg-background/90 backdrop-blur-md border-t border-border"
      } ${className}`}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${active ? activeColor : inactiveColor
                }`}
            >
              <tab.icon size={24} strokeWidth={active ? 2.5 : 2} className="drop-shadow-sm" />
              {/* Optional: label */}
              {/* <span className="text-[10px] font-semibold">{tab.label}</span> */}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
