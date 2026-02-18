import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Send, Paperclip, Image as ImageIcon, MoreVertical, Phone, Video, Loader2, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UserSearchModal from "@/components/admin/messages/UserSearchModal";
import { useSearchParams } from "react-router-dom";

const AdminMessages = () => {
    const { user: currentUser, profile } = useAuth();
    const [searchParams] = useSearchParams();

    // State
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'team' | 'users'>('all');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load & URL Params
    useEffect(() => {
        const init = async () => {
            if (!profile) return;
            await fetchConversations();

            // Check for userId in URL to auto-open chat
            const userIdParam = searchParams.get('userId');
            if (userIdParam) {
                openChatWithUser(userIdParam);
            }
        };
        init();
    }, [profile, searchParams]);

    // Fetch Conversations (Grouped by user)
    const fetchConversations = async () => {
        if (!profile) return;
        setIsLoading(true);

        try {
            // Get all messages where I am sender or receiver
            const { data: msgs, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, first_name, last_name, username, avatar_url, role),
                    receiver:receiver_id(id, first_name, last_name, username, avatar_url, role)
                `)
                .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Group by partner
            const conversationMap = new Map();

            msgs.forEach((msg: any) => {
                const partner = msg.sender_id === profile.id ? msg.receiver : msg.sender;
                if (!partner) return; // Should not happen

                if (!conversationMap.has(partner.id)) {
                    conversationMap.set(partner.id, {
                        partner,
                        lastMessage: msg,
                        unreadCount: (!msg.is_read && msg.receiver_id === profile.id) ? 1 : 0
                    });
                } else {
                    const existing = conversationMap.get(partner.id);
                    if (!msg.is_read && msg.receiver_id === profile.id) {
                        existing.unreadCount++;
                    }
                }
            });

            const formatted = Array.from(conversationMap.values()).map((c: any) => ({
                id: c.partner.id,
                partner: c.partner,
                lastMessage: c.lastMessage,
                unreadCount: c.unreadCount
            }));

            setConversations(formatted);

        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setIsLoading(false);
        }
    };

    // Open Chat
    const openChatWithUser = async (userId: string) => {
        try {
            // Check if we already have this conversation loaded
            const existing = conversations.find(c => c.id === userId);

            if (existing) {
                setActiveConversation(existing);
            } else {
                // Fetch user logic if not in list
                const { data: user, error } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, username, avatar_url')
                    .eq('id', userId)
                    .single();

                if (user && !error) {
                    const newConvo = {
                        id: user.id,
                        partner: user,
                        lastMessage: null,
                        unreadCount: 0
                    };
                    setActiveConversation(newConvo);
                    // Optionally add to list immediately or wait for message
                }
            }
        } catch (error) {
            console.error("Error opening chat:", error);
        }
    };

    // Fetch Messages for Active Chat
    useEffect(() => {
        if (!activeConversation || !profile) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${activeConversation.id}),and(sender_id.eq.${activeConversation.id},receiver_id.eq.${profile.id})`)
                .order('created_at', { ascending: true });

            if (data && !error) {
                setMessages(data);
                scrollToBottom();

                // Mark as read
                const unreadIds = data
                    .filter((m: any) => m.receiver_id === profile.id && !m.is_read)
                    .map((m: any) => m.id);

                if (unreadIds.length > 0) {
                    await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
                    // Update local count
                    setConversations(prev => prev.map(c =>
                        c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
                    ));
                }
            }
        };

        fetchMessages();

        // Subscribe to Realtime
        const channel = supabase
            .channel(`admin_chat:${activeConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `or(and(sender_id.eq.${profile.id},receiver_id.eq.${activeConversation.id}),and(sender_id.eq.${activeConversation.id},receiver_id.eq.${profile.id}))`
            }, (payload) => {
                const newMsg = payload.new;
                setMessages(prev => [...prev, newMsg]);
                scrollToBottom();

                // If received, mark read
                if (newMsg.receiver_id === profile.id) {
                    supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversation, profile]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeConversation || !profile) return;
        setIsSending(true);

        const content = inputText;
        setInputText(""); // Optimistic clear

        try {
            const { error } = await supabase.from('messages').insert({
                sender_id: profile.id,
                receiver_id: activeConversation.id,
                content: content,
                is_read: false
            });

            if (error) throw error;

            // Re-fetch conversations to update "Last Message" using a light query or just local state update
            // For now locally updating is complex due to ordering. Simple refetch:
            fetchConversations();

        } catch (error) {
            toast.error("Failed to send message");
            setInputText(content); // Restore
        } finally {
            setIsSending(false);
        }
    };

    const handleUserSelect = (user: any) => {
        setIsSearchOpen(false);
        const newConvo = {
            id: user.id,
            partner: user,
            lastMessage: null,
            unreadCount: 0
        };
        setActiveConversation(newConvo);
        setConversations(prev => {
            if (prev.find(c => c.id === user.id)) return prev;
            return [newConvo, ...prev];
        });
    };

    // --- Render Helpers ---

    const getInitials = (user: any) => {
        if (!user) return "??";
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase();
    };

    const getName = (user: any) => {
        if (!user) return "Unknown";
        return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    };

    const filteredConversations = conversations.filter(c => {
        if (filter === 'all') return true;
        if (filter === 'team') return c.partner.role === 'admin';
        if (filter === 'users') return c.partner.role !== 'admin';
        return true;
    });

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* --- Left Sidebar: Conversations --- */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-50 flex flex-col gap-4 sticky top-0 bg-white z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-gray-800">Messages</h2>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full hover:bg-gray-50 text-gray-600"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Plus size={20} />
                        </Button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                        {(['all', 'team', 'users'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize",
                                    filter === t
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-3 pb-2 pt-0">
                    <div className="bg-gray-50 flex items-center px-3 py-2 rounded-xl">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input
                            placeholder="Search conversations..."
                            className="bg-transparent border-none text-sm outline-none w-full placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-24 h-4 bg-gray-100 rounded" />
                                    <div className="w-16 h-3 bg-gray-50 rounded" />
                                </div>
                            </div>
                        ))
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-10 px-4 text-gray-400 text-sm">
                            No {filter !== 'all' ? filter : ''} conversations found.
                        </div>
                    ) : (
                        filteredConversations.map(convo => (
                            <div
                                key={convo.id}
                                onClick={() => setActiveConversation(convo)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                                    activeConversation?.id === convo.id ? "bg-primary/5 hover:bg-primary/10" : ""
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border border-gray-100">
                                        <AvatarImage src={convo.partner.avatar_url} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {getInitials(convo.partner)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {convo.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                            {convo.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={cn("text-sm font-semibold truncate", activeConversation?.id === convo.id ? "text-primary" : "text-gray-900")}>
                                            {getName(convo.partner)}
                                        </span>
                                        {convo.lastMessage && (
                                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                                {format(new Date(convo.lastMessage.created_at), 'MMM d')}
                                            </span>
                                        )}
                                    </div>
                                    <p className={cn("text-xs truncate", convo.unreadCount > 0 ? "font-medium text-gray-800" : "text-gray-500")}>
                                        {convo.lastMessage ? convo.lastMessage.content : "Draft"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- Right Main: Chat Area --- */}
            <div className={`flex-1 flex flex-col bg-gray-50/50 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0">
                            <div className="flex items-center gap-3">
                                <Button
                                    className="md:hidden -ml-2 mr-1"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    <Check className="rotate-180" /> {/* Should be Back Icon actually */}
                                </Button>
                                <Avatar className="h-9 w-9 border border-gray-100">
                                    <AvatarImage src={activeConversation.partner.avatar_url} />
                                    <AvatarFallback>{getInitials(activeConversation.partner)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{getName(activeConversation.partner)}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-green-600 font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                                    <Phone size={18} />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                                    <Video size={18} />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-50">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === profile?.id;
                                return (
                                    <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[75%] px-4 py-3 rounded-2xl text-sm relative shadow-sm",
                                            isMe
                                                ? "bg-primary text-white rounded-tr-sm"
                                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                                        )}>
                                            <p className="leading-relaxed">{msg.content}</p>
                                            <div className={cn(
                                                "text-[9px] mt-1 flex items-center gap-1 justify-end opacity-70",
                                                isMe ? "text-primary-foreground" : "text-gray-400"
                                            )}>
                                                {format(new Date(msg.created_at), 'h:mm a')}
                                                {isMe && (msg.is_read ? <CheckCheck size={12} /> : <Check size={12} />)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2 max-w-4xl mx-auto">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip size={20} />
                                </Button>
                                <Input
                                    className="flex-1 bg-gray-50 border-transparent focus:border-primary/20 focus:bg-white rounded-full h-11 px-5"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    className="rounded-full h-11 w-11 p-0 shadow-lg shadow-primary/25 disabled:opacity-50"
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || isSending}
                                >
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} className="opacity-20 text-gray-500" />
                        </div>
                        <p className="font-medium text-gray-400">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <UserSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleUserSelect}
            />

            <input type="file" ref={fileInputRef} className="hidden" />
        </div>
    );
};

export default AdminMessages;
