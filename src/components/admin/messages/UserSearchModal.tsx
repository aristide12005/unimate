import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming this hook exists, or I will implement simple debounce

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (user: any) => void;
}

const UserSearchModal = ({ isOpen, onClose, onSelect }: UserSearchModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 1) {
                searchUsers(searchTerm);
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const searchUsers = async (term: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, username, avatar_url, position, role')
                .or(`username.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
                .limit(10);

            if (data) setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or username..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="h-[300px] overflow-y-auto space-y-1">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-primary" />
                            </div>
                        ) : results.length === 0 && searchTerm.length > 1 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No users found
                            </div>
                        ) : (
                            results.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => onSelect(user)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-900 truncate">
                                            {user.first_name} {user.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>@{user.username}</span>
                                            {user.role === 'admin' && (
                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase font-bold">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}

                        {!searchTerm && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                Type to search specific people
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserSearchModal;
