import { useState, useEffect } from "react";
import { ArrowLeft, Bell, MessageCircle, Heart, Star, Info, AlertTriangle, Megaphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const NotificationScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            subscribeToNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = () => {
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user?.id}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsRead = async (id: string, url?: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

            if (url) {
                navigate(url);
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user?.id)
                .eq('is_read', false);

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIconAndColor = (type: string) => {
        switch (type) {
            case 'message': return { icon: MessageCircle, color: "bg-blue-100 text-blue-600" };
            case 'like': return { icon: Heart, color: "bg-red-100 text-red-600" };
            case 'system': return { icon: Info, color: "bg-gray-100 text-gray-600" };
            case 'alert': return { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-600" };
            case 'promotion': return { icon: Megaphone, color: "bg-purple-100 text-purple-600" };
            default: return { icon: Bell, color: "bg-gray-100 text-gray-600" };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 pt-12 shadow-sm sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900">Notifications</h1>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-primary text-xs font-semibold">
                        Mark all read
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="px-4 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400 text-sm">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const { icon: Icon, color } = getIconAndColor(notif.type);
                        return (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id, notif.action_url)}
                                className={`p-4 rounded-2xl border ${notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'} flex gap-4 transition-colors cursor-pointer active:scale-[0.98]`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-sm font-bold truncate pr-2 ${notif.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 line-clamp-2 ${notif.is_read ? 'text-gray-500' : 'text-blue-700/80'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationScreen;
