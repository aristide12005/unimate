import { Home, Users, Radio, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUnread } from "@/contexts/UnreadContext";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUnread();

  const isActive = (path: string) => location.pathname === path;

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      navigate('/login', { state: { returnTo: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 px-6 pt-4 pb-4 safe-bottom flex justify-between items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => navigate("/home")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/home") ? "text-primary" : "text-gray-400"}`}
      >
        <Home size={24} strokeWidth={isActive("/home") ? 2.5 : 2} />
        <span className="text-[10px] font-bold">Home</span>
      </button>

      <button
        onClick={() => navigate("/listings")}
        className={`flex flex-col items-center gap-1 transition-colors ${location.pathname.startsWith("/listings") ? "text-primary" : "text-gray-400"}`}
      >
        <Users size={24} strokeWidth={location.pathname.startsWith("/listings") ? 2.5 : 2} />
        <span className="text-[10px] font-bold">Rooms</span>
      </button>

      <button
        onClick={() => handleProtectedNavigation("/connect")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/connect") ? "text-primary" : "text-gray-400"}`}
      >
        <Radio size={24} strokeWidth={isActive("/connect") ? 2.5 : 2} />
        <span className="text-[10px] font-bold">Connect</span>
      </button>

      <button
        onClick={() => handleProtectedNavigation("/messages")}
        className={`relative flex flex-col items-center gap-1 transition-colors ${isActive("/messages") ? "text-primary" : "text-gray-400"}`}
      >
        <div className="relative">
          <MessageCircle size={24} strokeWidth={isActive("/messages") ? 2.5 : 2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Chat</span>
      </button>
    </div>
  );
};

export default BottomNav;
