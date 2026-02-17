import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UnreadContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = async () => {
        if (!user) return;

        // 1. Get Profile ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!profile) return;

        // 2. Count unread messages
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', profile.id)
            .eq('is_read', false);

        if (!error && count !== null) {
            setUnreadCount(count);
        }
    };

    useEffect(() => {
        refreshUnreadCount();

        if (!user) return;

        const getProfileId = async () => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();
            return profile?.id;
        }

        let channel: any;

        getProfileId().then((profileId) => {
            if (!profileId) return;

            channel = supabase
                .channel('global-unread-counter')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'messages',
                        filter: `receiver_id=eq.${profileId}`
                    },
                    () => {
                        // Refresh on any change (Insert new msg, or Update is_read)
                        refreshUnreadCount();
                    }
                )
                .subscribe();
        })

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <UnreadContext.Provider value={{ unreadCount, refreshUnreadCount }}>
            {children}
        </UnreadContext.Provider>
    );
};

export const useUnread = () => {
    const context = useContext(UnreadContext);
    if (context === undefined) {
        throw new Error("useUnread must be used within an UnreadProvider");
    }
    return context;
};
