import { useParams, useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, Camera, Send, Phone, Video, MoreVertical, Check, CheckCheck, Paperclip, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_LISTINGS, MOCK_CONVERSATIONS } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, profile: senderProfile } = useAuth();
    const [message, setMessage] = useState("");
    const [receiver, setReceiver] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    .eq("id", id)
                    .single();

                if (error || !data) {
                    // Try/Fall back just in case the id passed is user_id not profile_id
                    const retry = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("user_id", id)
                        .single();
                    data = retry.data;
                }

                if (data) {
                    setReceiver({
                        id: data.id,
                        authUserId: data.user_id,
                        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
                        avatar: data.avatar_url || "https://github.com/shadcn.png",
                        status: "Active now",
                        phone: "1234567890" // Placeholder
                    });
                }
                setLoading(false);
            }
        };
        fetchReceiver();
    }, [id]);

    // 2. Fetch Messages (Real) & Subscribe
    useEffect(() => {
        if (!senderProfile || !receiver || !receiver.id || typeof receiver.id === 'number') return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${senderProfile.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${senderProfile.id})`)
                .order('created_at', { ascending: true });

            if (data && !error) {
                const loadedMessages = data.map(m => ({
                    id: m.id,
                    text: m.content,
                    senderId: m.sender_id,
                    receiverId: m.receiver_id,
                    createdAt: m.created_at,
                    isRead: m.is_read,
                    attachmentUrl: m.attachment_url,
                    attachmentType: m.attachment_type
                }));
                setMessages(loadedMessages);

                // Mark unread messages from them as read immediately
                const unreadIds = loadedMessages
                    .filter(m => m.receiverId === senderProfile.id && !m.isRead)
                    .map(m => m.id);

                if (unreadIds.length > 0) {
                    await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
                    // Update local state to reflect read
                    setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, isRead: true } : m));
                }
            }
        };

        fetchMessages();

        const channel = supabase
            .channel(`chat:${senderProfile.id}:${receiver.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT and UPDATE
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id.eq.${senderProfile.id},receiver_id.eq.${receiver.id}),and(sender_id.eq.${receiver.id},receiver_id.eq.${senderProfile.id}))`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newMsg = {
                            id: payload.new.id,
                            text: payload.new.content,
                            senderId: payload.new.sender_id,
                            receiverId: payload.new.receiver_id,
                            createdAt: payload.new.created_at,
                            isRead: payload.new.is_read,
                            attachmentUrl: payload.new.attachment_url,
                            attachmentType: payload.new.attachment_type
                        };
                        setMessages(prev => [...prev, newMsg]);

                        // If I am the receiver, mark as read immediately
                        if (newMsg.receiverId === senderProfile.id) {
                            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, isRead: payload.new.is_read } : m));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [senderProfile, receiver]);

    const [contract, setContract] = useState<any>(null);

    // Fetch Contracts between these two users
    useEffect(() => {
        if (!senderProfile || !receiver?.id) return;

        const fetchContract = async () => {
            const { data } = await supabase
                .from('contracts' as any)
                .select('*, listing:listings(title, image)')
                .or(`and(host_id.eq.${senderProfile.id},student_id.eq.${receiver.id}),and(host_id.eq.${receiver.id},student_id.eq.${senderProfile.id})`)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) setContract(data);
        };

        fetchContract();
    }, [senderProfile, receiver]);


    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileSizeLimit = 5 * 1024 * 1024; // 5MB

        if (file.size > fileSizeLimit) {
            toast.error("File size too large (Max 5MB)");
            return;
        }

        setIsUploading(true);
        // Show specific loading toast if needed or rely on spinner
        const loadingToast = toast.loading("Uploading attachment...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${senderProfile?.id}/${fileName}`;

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            // 3. Determine Type
            let attachmentType = 'document';
            if (file.type.startsWith('image/')) attachmentType = 'image';
            else if (file.type.startsWith('video/')) attachmentType = 'video';

            // 4. Send Message with Attachment
            await sendMessageWithAttachment(publicUrl, attachmentType, file.name);
            toast.success("File sent!", { id: loadingToast });

        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file: " + (error.message || "Unknown error"), { id: loadingToast });
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const sendMessageWithAttachment = async (url: string, type: string, fileName: string) => {
        if (!senderProfile || !receiver?.id) return;

        const newMessage = {
            sender_id: senderProfile.id,
            receiver_id: receiver.id,
            content: type === 'image' ? 'Sent an image' : `Sent a file: ${fileName}`,
            attachment_url: url,
            attachment_type: type,
            is_read: false
        };

        // Optimistic UI
        const tempId = Date.now();
        setMessages(prev => [...prev, {
            id: tempId,
            text: newMessage.content,
            senderId: senderProfile.id,
            receiverId: receiver.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            attachmentUrl: url,
            attachmentType: type
        }]);

        const { error } = await supabase.from('messages').insert(newMessage);
        if (error) {
            toast.error("Failed to send attachment");
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        if (typeof receiver?.id === 'number') {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: message,
                senderId: 'me',
                createdAt: new Date().toISOString(),
                isRead: false
            }]);
            setMessage("");
            return;
        }

        if (!senderProfile || !receiver?.id) {
            toast.error("Cannot send message. User not found.");
            return;
        }

        const tempId = Date.now();
        const optimisticMessage = {
            id: tempId,
            text: message,
            senderId: senderProfile.id,
            receiverId: receiver.id,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setMessage("");

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderProfile.id,
                receiver_id: receiver.id,
                content: optimisticMessage.text,
                is_read: false
            });

        if (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error("Failed to send message");
        }
    };

    const handleCall = (type: 'phone' | 'video') => {
        if (!receiver) return;
        const phoneNumber = "1234567890"; // Placeholder
        if (type === 'phone') {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            window.open(`https://wa.me/${phoneNumber}?text=Hey`, '_blank');
        }
    };

    const renderMessageContent = (msg: any) => {
        if (msg.attachmentUrl) {
            if (msg.attachmentType === 'image') {
                return (
                    <div className="space-y-1">
                        <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            className="rounded-lg max-h-[200px] w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(msg.attachmentUrl, '_blank')}
                            onLoad={() => scrollToBottom()} // Scroll when image loads
                        />
                        {msg.text && msg.text !== 'Sent an image' && <p className="pt-1">{msg.text}</p>}
                    </div>
                );
            } else if (msg.attachmentType === 'video') {
                return (
                    <div className="space-y-1">
                        <video controls className="rounded-lg max-h-[200px] w-full bg-black">
                            <source src={msg.attachmentUrl} />
                            Your browser does not support video.
                        </video>
                        {msg.text && <p className="pt-1">{msg.text}</p>}
                    </div>
                );
            } else {
                return (
                    <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <div className="p-2 bg-white rounded-md shadow-sm">
                            <Paperclip size={20} className="text-gray-500" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate text-gray-700">Document</span>
                            <span className="text-[10px] text-gray-400">Click to view</span>
                        </div>
                    </a>
                );
            }
        }
        return <p>{msg.text}</p>;
    };

    // ─── SKELETON LOADER ───
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF8F6] to-[#FFF0EC] flex flex-col pb-24 font-sans">
                {/* Header Skeleton */}
                <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-orange-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="flex flex-col gap-1">
                            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Chat Body Skeleton */}
                <div className="flex-1 w-full pt-28 px-4 flex flex-col gap-4">
                    <div className="w-2/3 h-16 bg-white rounded-xl rounded-tl-none self-start animate-pulse p-4 flex flex-col gap-2">
                        <div className="w-full h-3 bg-gray-100 rounded"></div>
                        <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-1/2 h-12 bg-orange-100/50 rounded-xl rounded-tr-none self-end animate-pulse"></div>
                    <div className="w-3/4 h-20 bg-white rounded-xl rounded-tl-none self-start animate-pulse"></div>
                    <div className="w-2/3 h-16 bg-orange-100/50 rounded-xl rounded-tr-none self-end animate-pulse"></div>
                </div>

                {/* Footer Skeleton */}
                <div className="fixed bottom-0 left-0 right-0 z-50 px-2 py-2 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-3 max-w-4xl mx-auto">
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                        <div className="flex-1 h-12 bg-gray-100 rounded-full animate-pulse"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!receiver) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">User not found</div>;

    const user = receiver;

    // Helper to group messages
    const isSameSender = (index: number) => {
        if (index === 0) return false;
        const currentCheck = messages[index].senderId === currentUser?.id || messages[index].senderId === 'me' || (senderProfile && messages[index].senderId === senderProfile.id);
        const prevCheck = messages[index - 1].senderId === currentUser?.id || messages[index - 1].senderId === 'me' || (senderProfile && messages[index - 1].senderId === senderProfile.id);
        return currentCheck === prevCheck;
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF8F6] to-[#FFF0EC] font-sans pb-24">
            {/* ─── Premium Header (Fixed Block) ─── */}
            <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between 
                bg-white/90 backdrop-blur-xl border-b border-orange-100/50 shadow-sm transition-all duration-300">

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-orange-50 rounded-full text-gray-600 transition-colors duration-200"
                    >
                        <X size={26} strokeWidth={2} />
                    </button>

                    <div className="relative group cursor-pointer">
                        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary to-orange-400">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-gray-900 leading-tight">{user.name}</h1>
                            <p className="text-xs text-primary font-medium">{user.status || 'Active now'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                    <button
                        onClick={() => handleCall('phone')}
                        className="p-2 hover:bg-orange-50 hover:text-primary rounded-full transition-colors"
                    >
                        <Phone size={20} strokeWidth={2} />
                    </button>
                    <button
                        onClick={() => handleCall('video')}
                        className="p-2 hover:bg-orange-50 hover:text-primary rounded-full transition-colors"
                    >
                        <Video size={20} strokeWidth={2} />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-orange-50 hover:text-primary rounded-full transition-colors outline-none">
                                <MoreVertical size={20} strokeWidth={2} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 border-orange-100">
                            <DropdownMenuItem onClick={() => toast.info("Report feature coming soon")}>
                                Report User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Block feature coming soon")} className="text-red-600">
                                Block User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ─── Chat Body (Content with Padding) ─── */}
            <div className="w-full pt-24 px-4">
                {/* Contract Status Banner */}
                {contract && contract.status === 'pending' && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {contract.listing?.image && (
                                <img
                                    src={contract.listing.image}
                                    alt="Property"
                                    className="w-12 h-12 rounded-lg object-cover border border-orange-100 flex-shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm truncate">
                                    {contract.listing?.title || "Arrangement Request"}
                                </h3>
                                <p className="text-xs text-orange-600 font-medium">Pending Agreement</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/contract/${contract.id}`)}
                            className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex-shrink-0"
                        >
                            View
                        </button>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-60 space-y-3 animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-white rounded-full flex items-center justify-center mb-2 shadow-inner">
                            <img src={user.avatar} className="w-20 h-20 rounded-full opacity-80 grayscale mix-blend-multiply" />
                        </div>
                        <p className="text-gray-900 font-bold text-lg">Say hello to {user.name.split(' ')[0]}!</p>
                        <p className="text-sm text-gray-500 max-w-[200px]">Start your conversation with a friendly wave 👋</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId === currentUser?.id || msg.senderId === 'me' || (senderProfile && msg.senderId === senderProfile.id);
                        const isGrouped = isSameSender(index);

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full animate-in slide-in-from-bottom-2 duration-300 fill-mode-backwards",
                                    isMe ? 'justify-end' : 'justify-start',
                                    isGrouped ? 'mt-1' : 'mt-4'
                                )}
                            >
                                <div className={cn(
                                    "max-w-[75%] px-4 py-3 shadow-sm relative text-[15px] leading-relaxed",
                                    isMe
                                        ? "bg-gradient-to-br from-primary to-orange-600 text-white rounded-2xl rounded-tr-none shadow-orange-200"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none",
                                )}>
                                    {renderMessageContent(msg)}
                                    <div className={cn(
                                        "text-[10px] mt-1 flex items-center gap-1 opacity-80 float-right ml-2 font-medium",
                                        isMe ? "text-orange-50" : "text-gray-400"
                                    )}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (
                                            msg.isRead ? (
                                                <CheckCheck size={14} className="text-white" />
                                            ) : (
                                                <Check size={14} />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} className="h-4" /> {/* Spacer for scrolling */}
            </div>

            {/* ─── Input Bar (Fixed Bottom) ─── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-2 py-2 bg-white border-t border-gray-100">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                />

                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <Loader2 size={22} className="animate-spin text-primary" />
                        ) : (
                            <ImageIcon size={22} strokeWidth={2} />
                        )}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-all duration-200 active:scale-95 disabled:opacity-50"
                    >
                        <Paperclip size={22} strokeWidth={2} />
                    </button>

                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={isUploading ? "Uploading file..." : "Type a message..."}
                            disabled={isUploading}
                            className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-primary/20 
                                rounded-full px-6 py-3 pl-5 outline-none text-gray-900 placeholder:text-gray-400 
                                transition-all duration-300 shadow-inner focus:shadow-lg focus:shadow-primary/5 disabled:bg-gray-100"
                        />
                    </div>

                    <button
                        disabled={!message.trim() || isUploading}
                        onClick={handleSendMessage}
                        className="p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30 
                            disabled:opacity-50 disabled:shadow-none disabled:bg-gray-200 disabled:text-gray-400
                            hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <Send size={22} strokeWidth={2.5} className={message.trim() ? 'ml-0.5' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;
