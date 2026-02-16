import { ArrowLeft, Bell, MessageCircle, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: "message",
        title: "New Message from Fatou",
        message: "Hey! Is the room still available?",
        time: "2m ago",
        read: false,
        icon: MessageCircle,
        color: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        type: "like",
        title: "Moussa liked your listing",
        message: "Your 'Modern Studio' is getting attention!",
        time: "1h ago",
        read: false,
        icon: Heart,
        color: "bg-red-100 text-red-600"
    },
    {
        id: 3,
        type: "system",
        title: "Welcome to uniMate! 🇸🇳",
        message: "Complete your profile to find better matches.",
        time: "1d ago",
        read: true,
        icon: Star,
        color: "bg-yellow-100 text-yellow-600"
    },
    {
        id: 4,
        type: "system",
        title: "Tip: Verify your student status",
        message: "Verified users get 3x more responses.",
        time: "2d ago",
        read: true,
        icon: Bell,
        color: "bg-purple-100 text-purple-600"
    }
];

const NotificationScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 pt-12 shadow-sm sticky top-0 z-50 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-black text-gray-900">Notifications</h1>
            </div>

            {/* List */}
            <div className="px-4 py-4 space-y-3">
                {MOCK_NOTIFICATIONS.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'} flex gap-4 transition-colors`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                            <notif.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                    {notif.title}
                                </h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                            </div>
                            <p className={`text-sm mt-1 ${notif.read ? 'text-gray-500' : 'text-blue-700/80'}`}>
                                {notif.message}
                            </p>
                        </div>
                        {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            <div className="px-4 text-center mt-8">
                <p className="text-gray-400 text-sm">No more notifications</p>
            </div>
        </div>
    );
};

export default NotificationScreen;
