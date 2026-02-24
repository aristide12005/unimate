import { useState, useEffect } from "react";
import { Bell, MessageCircle, Heart, Info, AlertTriangle, Megaphone, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import BottomNav from "@/components/BottomNav";

const getIconAndColor = (type: string) => {
  switch (type) {
    case "message": return { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50" };
    case "like": return { icon: Heart, color: "text-red-500", bg: "bg-red-50" };
    case "system": return { icon: Info, color: "text-gray-500", bg: "bg-gray-100" };
    case "alert": return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50" };
    case "promotion": return { icon: Megaphone, color: "text-purple-500", bg: "bg-purple-50" };
    case "listing": return { icon: Home, color: "text-primary", bg: "bg-primary/10" };
    default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };
  }
};

const ActivityScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Real-time updates
    const channel = supabase
      .channel("activity-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string, actionUrl?: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    if (actionUrl) navigate(actionUrl);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-6">
      {/* Header */}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">Your recent notifications</p>
      </div>

      {/* Content */}
      <div className="mt-4 px-5 space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-card shadow-sm animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-foreground">No activity yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Notifications will appear here when you get messages or updates.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const { icon: Icon, color, bg } = getIconAndColor(item.type);
            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id, item.action_url)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl shadow-sm cursor-pointer active:scale-[0.98] transition-transform ${item.is_read ? "bg-card" : "bg-blue-50/60 border border-blue-100"
                  }`}
              >
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-bold truncate ${item.is_read ? "text-foreground" : "text-blue-900"}`}>
                      {item.title}
                    </h3>
                    {!item.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                  {item.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground/70 font-semibold mt-1 block">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ActivityScreen;
