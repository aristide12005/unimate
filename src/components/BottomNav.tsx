import { Home, Users, Newspaper, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-8 flex justify-between items-center z-50">
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
        <span className="text-[10px] font-bold">Mates</span>
      </button>

      <button
        onClick={() => navigate("/explore")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/explore") ? "text-primary" : "text-gray-400"}`}
      >
        <Newspaper size={24} strokeWidth={isActive("/explore") ? 2.5 : 2} />
        <span className="text-[10px] font-bold">News</span>
      </button>

      <button
        onClick={() => navigate("/messages")}
        className={`flex flex-col items-center gap-1 transition-colors ${isActive("/messages") ? "text-primary" : "text-gray-400"}`}
      >
        <MessageCircle size={24} strokeWidth={isActive("/messages") ? 2.5 : 2} />
        <span className="text-[10px] font-bold">Chat</span>
      </button>
    </div>
  );
};

export default BottomNav;
