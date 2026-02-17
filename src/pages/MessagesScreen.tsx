import { Search, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import { MOCK_CONVERSATIONS } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MessagesScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      // 0. Get My Profile ID
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!myProfile) return;
      const myProfileId = myProfile.id;

      // 1. Fetch all messages involving me (using Profile ID)
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${myProfileId},receiver_id.eq.${myProfileId}`)
        .order('created_at', { ascending: false });

      if (error || !messages) {
        setLoading(false);
        return;
      }

      // 2. Group by unique partner and get last message
      const conversationMap = new Map();
      const partnerIds = new Set();

      messages.forEach(msg => {
        const partnerProfileId = msg.sender_id === myProfileId ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerProfileId)) {
          conversationMap.set(partnerProfileId, {
            lastMessage: msg,
            unread: (!msg.is_read && msg.receiver_id === myProfileId) ? 1 : 0
          });
          partnerIds.add(partnerProfileId);
        } else {
          const current = conversationMap.get(partnerProfileId);
          if (!msg.is_read && msg.receiver_id === myProfileId) {
            current.unread += 1;
          }
        }
      });

      // 3. Fetch Partner Profiles
      if (partnerIds.size === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Fetch profiles by 'id' (UUID) which matches the foreign key
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, username, avatar_url')
        .in('id', Array.from(partnerIds));

      const partnersMap = new Map();
      profiles?.forEach(p => {
        partnersMap.set(p.id, p); // Map by Profile ID
      });

      // 4. Combine data
      const formattedConversations = Array.from(conversationMap.entries()).map(([partnerProfileId, info]) => {
        const profile = partnersMap.get(partnerProfileId);
        // Fallback if profile not found (maybe deleted user)
        const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : "Unknown User";
        const avatar = profile?.avatar_url || "https://github.com/shadcn.png";

        return {
          id: partnerProfileId, // Navigate using Profile ID
          name,
          avatar,
          lastMessage: info.lastMessage.content,
          time: new Date(info.lastMessage.created_at).toLocaleDateString(),
          unread: info.unread,
          initials: name.substring(0, 2).toUpperCase()
        };
      });

      setConversations(formattedConversations);
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages (Requires getting profile ID first, simplified here by just refetching periodically or ignoring real-time update filter optimization for a moment)
    // To do it right: fetchProfile -> then subscribe.
    // For now, let's just rely on manual refresh or simplistic poll/subscription without extensive filtering if possible, or just skip sub for this specific screen update step to ensure stability first.
    // Actually, let's keep it simple: no subscription for this specific list for now to avoid complexity errors, just load on mount.

  }, [user]);

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
        {loading ? (
          <div className="space-y-4 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-10 h-3" />
                  </div>
                  <Skeleton className="w-3/4 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-2">No messages yet.</p>
            <p className="text-sm">Start a chat from a listing!</p>
          </div>
        ) : (
          conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => navigate(`/chat/${convo.id}`)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-card active:scale-[0.98] transition-all"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {convo.avatar ? (
                    <img src={convo.avatar} alt={convo.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-secondary">{convo.initials}</span>
                  )}
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
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MessagesScreen;
