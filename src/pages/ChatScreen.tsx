import { useParams, useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, Camera, Send, Phone, Video, MoreVertical, Check, CheckCheck, Paperclip, Loader2, Plus, Home, ShieldAlert } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import JSConfetti from 'js-confetti';
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
import { Trash2, Edit2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReportUserDialog from "@/components/ReportUserDialog";

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
    const [editingMessage, setEditingMessage] = useState<any>(null);
    const [editContent, setEditContent] = useState("");
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isBlockAlertOpen, setIsBlockAlertOpen] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
    const [newConditionText, setNewConditionText] = useState("");
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [listingModalTitle, setListingModalTitle] = useState("Share a Listing");
    const [myListings, setMyListings] = useState<any[]>([]);

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
                        phone: data.phone || ""
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
                    attachmentType: m.attachment_type,
                    isEdited: m.is_edited,
                    isDeleted: m.is_deleted,
                    messageType: m.message_type || 'text',
                    payload: m.payload,
                    status: m.status
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
                            attachmentType: payload.new.attachment_type,
                            isEdited: payload.new.is_edited,
                            isDeleted: payload.new.is_deleted,
                            messageType: payload.new.message_type || 'text',
                            payload: payload.new.payload,
                            status: payload.new.status
                        };
                        setMessages(prev => {
                            // Dedup logic just in case
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });

                        // If I am the receiver, mark as read immediately
                        if (newMsg.receiverId === senderProfile.id) {
                            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? {
                            ...m,
                            text: payload.new.content,
                            isRead: payload.new.is_read,
                            isEdited: payload.new.is_edited,
                            isDeleted: payload.new.is_deleted,
                            status: payload.new.status
                        } : m));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [senderProfile, receiver]);

    const handleMatchConfirmed = async () => {
        const jsConfetti = new JSConfetti();
        jsConfetti.addConfetti({
            emojis: ['🏠', '🎉', '🌟', '🥂'],
            confettiNumber: 60,
        });

        toast.success("Match Confirmed! We've automatically archived any active listings.");

        if (senderProfile) {
            await supabase
                .from('listings')
                .update({ status: 'archived' })
                .eq('author_id', senderProfile.id)
                .eq('status', 'active');
        }
    };

    // Check if user is blocked
    useEffect(() => {
        if (!senderProfile || !receiver?.id) return;

        const checkBlockStatus = async () => {
            const { data } = await supabase
                .from('blocked_users')
                .select('*')
                .eq('blocker_id', senderProfile.id)
                .eq('blocked_id', receiver.id)
                .single();

            if (data) setIsBlocked(true);
        };

        checkBlockStatus();
    }, [senderProfile, receiver]);

    const handleBlockUser = async () => {
        if (!senderProfile || !receiver?.id) return;

        try {
            const { error } = await supabase
                .from('blocked_users')
                .insert({
                    blocker_id: senderProfile.id,
                    blocked_id: receiver.id
                });

            if (error) throw error;

            setIsBlocked(true);
            toast.success("User blocked");
            setIsBlockAlertOpen(false);
        } catch (error) {
            console.error("Block failed:", error);
            toast.error("Failed to block user");
        }
    };

    const handleUnblockUser = async () => {
        if (!senderProfile || !receiver?.id) return;

        try {
            const { error } = await supabase
                .from('blocked_users')
                .delete()
                .eq('blocker_id', senderProfile.id)
                .eq('blocked_id', receiver.id);

            if (error) throw error;

            setIsBlocked(false);
            toast.success("User unblocked");
        } catch (error) {
            console.error("Unblock failed:", error);
            toast.error("Failed to unblock user");
        }
    };


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

    const handleSendCondition = async () => {
        if (!newConditionText.trim() || !senderProfile || !receiver?.id) return;

        const optimisticMessage = {
            id: Date.now(),
            text: "",
            senderId: senderProfile.id,
            receiverId: receiver.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            messageType: 'condition_proposal',
            payload: { text: newConditionText },
            status: 'pending'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setIsConditionModalOpen(false);
        setNewConditionText("");

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderProfile.id,
                receiver_id: receiver.id,
                content: "",
                is_read: false,
                message_type: 'condition_proposal',
                payload: { text: newConditionText },
                status: 'pending'
            });

        if (error) {
            toast.error("Failed to propose condition.");
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        }
    };

    const handleShareListing = async (listing: any) => {
        if (!senderProfile || !receiver?.id) return;

        const optimisticMessage = {
            id: Date.now(),
            text: "",
            senderId: senderProfile.id,
            receiverId: receiver.id,
            createdAt: new Date().toISOString(),
            isRead: false,
            messageType: 'listing_share',
            payload: {
                id: listing.id,
                title: listing.title,
                price: listing.price,
                image: listing.image
            }
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setIsListingModalOpen(false);

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderProfile.id,
                receiver_id: receiver.id,
                content: "",
                is_read: false,
                message_type: 'listing_share',
                payload: optimisticMessage.payload
            });

        if (error) {
            toast.error("Failed to share listing.");
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        }
    };

    // Fetch listings when opening modal (either mine or theirs)
    const openListingModal = async (type: 'mine' | 'theirs') => {
        if (!senderProfile || !receiver?.id) return;
        setIsListingModalOpen(true);

        const targetId = type === 'mine' ? senderProfile.id : receiver.id;
        setListingModalTitle(type === 'mine' ? "Share My Listing" : "Share Their Listing");

        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('author_id', targetId);

        if (data) setMyListings(data);
    };

    const updateConditionStatus = async (msgId: string | number, newStatus: 'accepted' | 'declined') => {
        // Optimistic UI
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: newStatus } : m));

        const { error } = await supabase
            .from('messages')
            .update({ status: newStatus })
            .eq('id', msgId);

        if (error) {
            toast.error(`Failed to mark condition as ${newStatus}.`);
        }
    };

    const handleDeleteMessage = async (msgId: any) => {
        // Optimistic update
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeleted: true } : m));

        const { error } = await supabase
            .from('messages')
            .update({ is_deleted: true })
            .eq('id', msgId);

        if (error) {
            toast.error("Failed to delete message");
            // Revert logic could be complex without full reload, but it's fine for now
        }
    };

    const handleEditMessage = (msg: any) => {
        setEditingMessage(msg);
        setEditContent(msg.text);
    };

    const submitEditMessage = async () => {
        if (!editingMessage) return;

        const oldContent = editingMessage.text;
        // Optimistic
        setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: editContent, isEdited: true } : m));
        setEditingMessage(null);

        const { error } = await supabase
            .from('messages')
            .update({ content: editContent, is_edited: true })
            .eq('id', editingMessage.id);

        if (error) {
            toast.error("Failed to edit message");
            // Revert
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text: oldContent, isEdited: false } : m));
        }
    };

    const handleCall = (type: 'phone' | 'video') => {
        if (!receiver) return;

        const phoneNumber = receiver.phone;

        if (!phoneNumber) {
            toast.error("Phone number not available for this user");
            return;
        }

        if (type === 'phone') {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            // Assuming video call integration or just WhatsApp for now
            window.open(`https://wa.me/${phoneNumber}?text=Hey`, '_blank');
        }
    };

    const renderMessageContent = (msg: any) => {
        const isMe = msg.senderId === currentUser?.id || msg.senderId === 'me' || (senderProfile && msg.senderId === senderProfile.id);

        if (msg.isDeleted) {
            return (
                <p className="italic text-sm opacity-70 flex items-center gap-2">
                    <Trash2 size={12} /> This message was deleted
                </p>
            );
        }

        // Conversational Commerce: Listing Share Bubble
        if (msg.messageType === 'listing_share' && msg.payload) {
            return (
                <div className="w-[260px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Home size={16} className={isMe ? "text-orange-100" : "text-gray-400"} />
                        <p className={`text-xs font-bold uppercase tracking-wide ${isMe ? "text-orange-200" : "text-gray-500"}`}>
                            Shared Listing
                        </p>
                    </div>
                    <div
                        onClick={() => navigate(`/listings/${msg.payload.id}`)}
                        className={`overflow-hidden rounded-xl border cursor-pointer active:scale-95 transition-transform ${isMe ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}
                    >
                        <div className="h-32 w-full relative">
                            <img src={msg.payload.image} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                            <h4 className={`font-bold text-sm truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>{msg.payload.title}</h4>
                            <p className={`font-bold mt-1 ${isMe ? 'text-orange-200' : 'text-primary'}`}>{msg.payload.price}</p>
                        </div>
                    </div>
                    <div className="mt-2 text-center text-xs font-bold hover:underline cursor-pointer">
                        Tap to view details
                    </div>
                </div>
            );
        }

        // Conversational Commerce: Condition/Rule Proposal Bubble
        if (msg.messageType === 'condition_proposal' && msg.payload) {
            return (
                <div className="w-[280px]">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert size={16} className={isMe ? "text-orange-100" : "text-gray-400"} />
                        <p className={`text-xs font-bold uppercase tracking-wide ${isMe ? "text-orange-200" : "text-gray-500"}`}>
                            Proposed Rule / Vibe
                        </p>
                    </div>

                    <p className="text-[15px] font-medium leading-relaxed mb-4">
                        "{msg.payload.text}"
                    </p>

                    {/* Action Buttons (Only show to the receiver if pending) */}
                    {!isMe && msg.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateConditionStatus(msg.id, 'accepted'); }}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-700 border border-green-500/20 py-2 rounded-xl text-sm font-bold transition-colors"
                            >
                                <Check size={16} /> Agree
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateConditionStatus(msg.id, 'declined'); }}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-700 border border-red-500/20 py-2 rounded-xl text-sm font-bold transition-colors"
                            >
                                <X size={16} /> Decline
                            </button>
                        </div>
                    )}

                    {/* Status Indicators */}
                    <div className="mt-3">
                        {msg.status === 'pending' && isMe && (
                            <div className="text-white/70 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 bg-black/10 px-3 py-1.5">
                                <Loader2 size={12} className="animate-spin" /> Waiting for response...
                            </div>
                        )}
                        {msg.status === 'accepted' && (
                            <div className={`text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 ${isMe ? 'bg-white/20 text-white' : 'bg-green-50 text-green-700'}`}>
                                <CheckCheck size={14} /> Agreed
                            </div>
                        )}
                        {msg.status === 'declined' && (
                            <div className={`text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 ${isMe ? 'bg-black/20 text-white' : 'bg-red-50 text-red-700'}`}>
                                <X size={14} /> Declined
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        if (msg.isDeleted) {
            return (
                <p className="italic text-sm opacity-70 flex items-center gap-2">
                    <Trash2 size={12} /> This message was deleted
                </p>
            );
        }

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
        return (
            <div>
                <p>{msg.text}</p>
                {msg.isEdited && <span className="text-[10px] opacity-60 italic block text-right mt-1">Edited</span>}
            </div>
        );
    };

    // ─── SKELETON LOADER ───
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-[#FFF8F6] to-[#FFF0EC] flex flex-col pb-24 font-sans">
                {/* Header Skeleton */}
                <div className="fixed top-0 lg:top-16 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-orange-100/50">
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
            <div className="fixed top-0 lg:top-16 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between 
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
                        onClick={handleMatchConfirmed}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-primary text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 mr-2"
                    >
                        <Check size={14} /> Match Confirmed
                    </button>
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
                            <DropdownMenuItem onClick={() => setIsReportOpen(true)}>
                                Report User
                            </DropdownMenuItem>
                            {isBlocked ? (
                                <DropdownMenuItem onClick={handleUnblockUser}>
                                    Unblock User
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => setIsBlockAlertOpen(true)} className="text-red-600">
                                    Block User
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ─── Chat Body (Content with Padding) ─── */}
            <div className="w-full pt-24 lg:pt-36 px-4">

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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className={cn(
                                            "max-w-[75%] px-4 py-3 shadow-sm relative text-[15px] leading-relaxed cursor-pointer transition-transform active:scale-95",
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
                                    </DropdownMenuTrigger>

                                    {isMe && !msg.isDeleted && (
                                        <DropdownMenuContent align={isMe ? "end" : "start"}>
                                            <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                                                <Edit2 size={14} className="mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-red-600">
                                                <Trash2 size={14} className="mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    )}
                                </DropdownMenu>
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
                    {/* The + Attachment Menu */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button disabled={isBlocked || isUploading} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50">
                                <Plus size={22} className={isUploading ? "animate-spin" : ""} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2 rounded-2xl shadow-xl border border-gray-100 mb-2 ml-2" align="start" sideOffset={10}>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => { document.body.click(); openListingModal('mine'); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors text-left w-full group">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Home size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Share My Listing</span>
                                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">Send a room preview</span>
                                    </div>
                                </button>
                                <button onClick={() => { document.body.click(); openListingModal('theirs'); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors text-left w-full group mt-1">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        <Home size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Share Their Listing</span>
                                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">Ask about their room</span>
                                    </div>
                                </button>
                                <button onClick={() => { document.body.click(); setIsConditionModalOpen(true); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors text-left w-full group mt-1">
                                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                        <ShieldAlert size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Propose a Rule / Vibe</span>
                                        <span className="text-[10px] text-gray-400 font-medium tracking-wide">Send a Yes/No agreement</span>
                                    </div>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>

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
                            placeholder={isUploading ? "Uploading file..." : isBlocked ? "You have blocked this user" : "Type a message..."}
                            disabled={isUploading || isBlocked}
                            className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-primary/20 
                                rounded-full px-6 py-3 pl-5 outline-none text-gray-900 placeholder:text-gray-400 
                                transition-all duration-300 shadow-inner focus:shadow-lg focus:shadow-primary/5 disabled:bg-gray-100 disabled:text-gray-500"
                        />
                    </div>

                    <button
                        disabled={!message.trim() || isUploading || isBlocked}
                        onClick={handleSendMessage}
                        className="p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30 
                            disabled:opacity-50 disabled:shadow-none disabled:bg-gray-200 disabled:text-gray-400
                            hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <Send size={22} strokeWidth={2.5} className={message.trim() ? 'ml-0.5' : ''} />
                    </button>
                </div>
            </div>

            {/* Listing Selection Dialog */}
            <Dialog open={isListingModalOpen} onOpenChange={setIsListingModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black">
                            <Home className="text-primary" /> {listingModalTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                        {myListings.length === 0 ? (
                            <p className="text-gray-500 text-center py-6 text-sm font-medium">No active listings to share.</p>
                        ) : (
                            myListings.map(listing => (
                                <div
                                    key={listing.id}
                                    onClick={() => handleShareListing(listing)}
                                    className="flex items-center gap-4 p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-primary/30 cursor-pointer transition-all active:scale-95 group"
                                >
                                    <img src={listing.image} alt={listing.title} className="w-16 h-16 rounded-xl object-cover" />
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{listing.title}</h4>
                                        <p className="font-bold text-primary text-sm mt-0.5">{listing.price}</p>
                                    </div>
                                    <Send size={18} className="text-gray-300 group-hover:text-primary mr-2 transition-colors" />
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <AlertDialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Message</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            autoFocus
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEditingMessage(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={submitEditMessage}>Save</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Block Confirmation Dialog */}
            <AlertDialog open={isBlockAlertOpen} onOpenChange={setIsBlockAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Block User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to block this user? They will not be able to message you.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">Block</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Report Dialog */}
            {receiver && (
                <ReportUserDialog
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    reportedUserId={receiver.id}
                    reportedUserName={receiver.name}
                />
            )}
        </div>
    );
};

export default ChatScreen;
