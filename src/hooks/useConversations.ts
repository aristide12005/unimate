import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_CONVERSATIONS } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const useConversations = () => {
    const { user, profile } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !profile) return;

        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from('conversation_list' as any)
                .select('*')
                .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
                .order('created_at', { ascending: false });

            if (data && !error) {
                // Map to UI model
                const formatted = data.map((c: any) => {
                    const isSender = c.sender_id === profile.id;
                    return {
                        id: isSender ? c.receiver_id : c.sender_id, // Return the ID of the OTHER person
                        name: isSender
                            ? `${c.receiver_first_name || ''} ${c.receiver_last_name || ''}`.trim()
                            : `${c.sender_first_name || ''} ${c.sender_last_name || ''}`.trim(),
                        avatar: isSender ? c.receiver_avatar_url : c.sender_avatar_url,
                        lastMessage: c.content,
                        time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: !c.is_read && !isSender ? 1 : 0
                    };
                });
                setConversations(formatted);
            } else {
                console.error("Error fetching conversations:", error);
                // Fallback to mock if view not present yet
                setConversations(MOCK_CONVERSATIONS);
            }
            setLoading(false);
        };

        fetchConversations();
    }, [user, profile]);

    return { conversations, loading };
};
