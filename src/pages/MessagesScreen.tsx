import { Search, Edit3 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const conversations = [
  { id: 1, name: "Mary Johnson", initials: "MJ", lastMessage: "See you at the library! 📚", time: "2m", unread: 3 },
  { id: 2, name: "Study Group 101", initials: "SG", lastMessage: "Who's bringing notes tomorrow?", time: "15m", unread: 12 },
  { id: 3, name: "Alex Chen", initials: "AC", lastMessage: "Thanks for the help!", time: "1h", unread: 0 },
  { id: 4, name: "Campus Events", initials: "CE", lastMessage: "🎉 New event posted: Spring Fest", time: "2h", unread: 1 },
  { id: 5, name: "Kevin O.", initials: "KO", lastMessage: "Lol that was hilarious 😂", time: "3h", unread: 0 },
  { id: 6, name: "Lisa Park", initials: "LP", lastMessage: "Can you send me the slides?", time: "5h", unread: 0 },
  { id: 7, name: "Dorm 4B Chat", initials: "D4", lastMessage: "Pizza night tonight? 🍕", time: "1d", unread: 5 },
];

const MessagesScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Messages</h1>
        <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Edit3 size={18} className="text-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3.5 shadow-sm">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="mt-4 px-5 space-y-1">
        {conversations.map((convo) => (
          <button
            key={convo.id}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-card active:scale-[0.98] transition-all"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-secondary">{convo.initials}</span>
              </div>
              {convo.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground">{convo.unread}</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground truncate">{convo.name}</h3>
                <span className="text-[10px] text-muted-foreground font-semibold shrink-0 ml-2">{convo.time}</span>
              </div>
              <p className={`text-xs mt-0.5 truncate ${convo.unread > 0 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                {convo.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default MessagesScreen;
