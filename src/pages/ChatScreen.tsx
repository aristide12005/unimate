```javascript
import { useParams, useNavigate } from "react-router-dom";
import { X, Image, Camera, Send, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react"; // Added useRef
import { useAuth } from "@/contexts/AuthContext"; // Added useAuth
import { supabase } from "@/integrations/supabase/client"; // Added supabase
import { MOCK_LISTINGS, MOCK_CONVERSATIONS } from "@/data/mockData";

const ChatScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [message, setMessage] = useState("");
    const [receiver, setReceiver] = useState<any>(null);
    const [senderProfile, setSenderProfile] = useState<any>(null); // Store current user's profile
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Auto-scroll ref

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 0. Fetch SENDER Profile (Me)
    useEffect(() => {
        if (!currentUser) return;
        const fetchSender = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", currentUser.id)
                .single();
            setSenderProfile(data);
        };
        fetchSender();
    }, [currentUser]);

    // 1. Fetch RECEIVER Profile
    useEffect(() => {
        const fetchReceiver = async () => {
            if (!id) return;
            const isMockId = !isNaN(Number(id));

            if (isMockId) {
                // Fallback to mock
                const listingUser = MOCK_LISTINGS.find((l) => l.author.id === Number(id))?.author;
                const conversationUser = MOCK_CONVERSATIONS.find((c) => c.id === Number(id));
                const mockUser = listingUser || (conversationUser ? {
                    name: conversationUser.name,
                    avatar: conversationUser.avatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3",
                    id: conversationUser.id
                } : null);
                setReceiver(mockUser);
                setLoading(false);
            } else {
                // Fetch real user
                let { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", id) // Assumes 'id' param IS the profile UUID
                    .single();

                if (error || !data) {
                    // Try/Fall back just in case
                    const retry = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("user_id", id)
                        .single();
                    data = retry.data;
                }

                if (data) {
                    setReceiver({
                        id: data.id, // Use Public Profile ID for 'messages' table
                        authUserId: data.user_id, // Keep verify if needed
                        name: `${ data.first_name || '' } ${ data.last_name || '' } `.trim() || data.username,
                        avatar: data.avatar_url || "https://github.com/shadcn.png"
                    });
                }
                setLoading(false);
            }
        };
        fetchReceiver();
    }, [id]);

    // 2. Fetch Messages (Real)
    useEffect(() => {
        if (!senderProfile || !receiver || !receiver.id || typeof receiver.id === 'number') return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${ senderProfile.id }, receiver_id.eq.${ receiver.id }), and(sender_id.eq.${ receiver.id }, receiver_id.eq.${ senderProfile.id })`)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data.map(m => ({
                    id: m.id,
                    text: m.content,
                    senderId: m.sender_id,
                    createdAt: m.created_at
                })));
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id = eq.${ senderProfile.id } ` // Listen for messages sent TO me (My Profile ID)
                },
                (payload) => {
                    if (payload.new.sender_id === receiver.id) {
                        setMessages(prev => [...prev, {
                            id: payload.new.id,
                            text: payload.new.content,
                            senderId: payload.new.sender_id,
                            createdAt: payload.new.created_at
                        }]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [senderProfile, receiver]); // Depend on senderProfile


    const handleSendMessage = async () => {
        if (!message.trim()) return;

        if (typeof receiver?.id === 'number') {
            console.log("Mock message sent:", message);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: message,
                senderId: 'me',
                createdAt: new Date().toISOString()
            }]);
            setMessage("");
            return;
        }

        if (!senderProfile || !receiver?.id) return;

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderProfile.id, // Use MY Profile ID
                receiver_id: receiver.id,    // Use THEIR Profile ID
                content: message,
                is_read: false
            });

        if (!error) {
            setMessages(prev => [...prev, {
                id: Date.now(), // Temp ID until refresh
                text: message,
                senderId: senderProfile.id,
                createdAt: new Date().toISOString()
            }]);
            setMessage("");
        } else {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!receiver) return <div className="p-8">User not found</div>;

    const user = receiver; // Alias for internal render

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* ─── Header ─── */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-blue-500">
                    <X size={28} strokeWidth={1.5} />
                </button>

                <h1 className="text-lg font-bold text-gray-900">{user.name}</h1>

                <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full text-blue-500">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                </button>
            </div>

            {/* ─── Chat Body ─── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <p className="text-gray-900 font-medium text-lg">Send the first message</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id || msg.senderId === 'me';
                        return (
                            <div key={msg.id} className={`flex ${ isMe ? 'justify-end' : 'justify-start' } `}>
                                <div className={`max - w - [75 %] px - 4 py - 2 rounded - 2xl ${
    isMe
        ? 'bg-primary text-white rounded-tr-none'
        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
} `}>
                                    <p className="text-sm">{msg.text}</p>
                                    <span className={`text - [10px] block text - right mt - 1 ${ isMe ? 'text-primary-foreground/70' : 'text-gray-400' } `}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Bar ─── */}
            <div className="px-4 py-3 safe-area-bottom border-t border-gray-100 bg-white flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-full text-primary">
                    <Image size={24} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full text-primary">
                    <Camera size={24} />
                </button>

                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message"
                        className="bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 w-full text-sm"
                    />
                </div>

                <button
                    disabled={!message.trim()}
                    onClick={handleSendMessage}
                    className="p-2 rounded-full text-primary disabled:text-gray-300 transition-colors"
                >
                    <Send size={24} />
                </button>
            </div>
        </div>
    );
};

export default ChatScreen;
