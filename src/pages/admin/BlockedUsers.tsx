import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, Ban, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const BlockedUsers = () => {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blocked_users')
                .select(`
                    *,
                    blocker:blocker_id(id, first_name, last_name, username, avatar_url),
                    blocked:blocked_id(id, first_name, last_name, username, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBlocks(data || []);
        } catch (error) {
            console.error("Error fetching blocked users:", error);
            toast.error("Failed to load blocked users");
        } finally {
            setLoading(false);
        }
    };

    const unblockUser = async (id: number) => {
        if (!confirm("Are you sure you want to remove this block?")) return;

        try {
            const { error } = await supabase
                .from('blocked_users')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setBlocks(prev => prev.filter(b => b.id !== id));
            toast.success("Block removed successfully");
        } catch (error) {
            console.error("Error removing block:", error);
            toast.error("Failed to remove block");
        }
    };

    const filteredBlocks = blocks.filter(block => {
        const matchesSearch =
            block.blocker?.username?.toLowerCase().includes(search.toLowerCase()) ||
            block.blocker?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            block.blocked?.username?.toLowerCase().includes(search.toLowerCase()) ||
            block.blocked?.first_name?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blocked Users</h1>
                    <p className="text-gray-500 text-sm">Monitor user blocking activity</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by username..."
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Blocker</th>
                                <th className="px-6 py-4">Blocked User</th>
                                <th className="px-6 py-4">Date Blocked</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading blocked users...
                                    </td>
                                </tr>
                            ) : filteredBlocks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No blocked users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBlocks.map((block) => (
                                    <tr key={block.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={block.blocker?.avatar_url} />
                                                    <AvatarFallback>{block.blocker?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {block.blocker?.first_name} {block.blocker?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{block.blocker?.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={block.blocked?.avatar_url} />
                                                    <AvatarFallback>{block.blocked?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {block.blocked?.first_name} {block.blocked?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{block.blocked?.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {format(new Date(block.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => unblockUser(block.id)}
                                            >
                                                <Unlock className="h-4 w-4 mr-1" /> Unblock
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BlockedUsers;
