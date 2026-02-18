import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, MessageCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const TeamManagement = () => {
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "admin") // Filter for admins only
                .order("first_name", { ascending: true });

            if (error) throw error;
            setTeam(data || []);
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeam = team.filter(member =>
        member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Admin Team</h1>
                <Button>Invite Member</Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                    placeholder="Search team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center animate-pulse">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mb-3" />
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-32 bg-gray-200 rounded mb-4" />
                            <div className="flex gap-2 w-full mt-auto">
                                <div className="h-9 bg-gray-200 rounded flex-1" />
                                <div className="h-9 bg-gray-200 rounded flex-1" />
                            </div>
                        </div>
                    ))
                ) : filteredTeam.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No team members found matching your search.
                    </div>
                ) : (
                    filteredTeam.map((member) => (
                        <div key={member.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center relative group">

                            <div className="absolute top-4 right-4">
                                <div className={`h-2.5 w-2.5 rounded-full ${member.is_whatsapp ? 'bg-green-500' : 'bg-gray-300'}`} title={member.is_whatsapp ? "On WhatsApp" : "Offline"} />
                            </div>

                            <div className="mb-2 mt-1">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary tracking-wider uppercase">
                                    {member.position || "Administrator"}
                                </span>
                            </div>

                            <Avatar className="h-20 w-20 mb-3 border-2 border-gray-50 shadow-sm">
                                <AvatarImage src={member.avatar_url} className="object-cover" />
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
                                    {member.first_name?.[0]}{member.last_name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {member.first_name} {member.last_name}
                            </h3>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 mt-1">
                                <Mail size={12} />
                                <span className="truncate max-w-[180px]">{member.username}</span>
                            </div>

                            <div className="flex gap-2 w-full mt-auto">
                                <Button
                                    className="flex-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-900 border-0 h-9 text-xs font-medium"
                                    onClick={() => {
                                        // Navigate to Admin Messages with user ID
                                        navigate(`/admin/messages?userId=${member.id}`);
                                    }}
                                >
                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Internal Chat
                                </Button>
                                <Button
                                    className="flex-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 shadow-md h-9 text-xs font-medium"
                                    onClick={() => {
                                        if (member.phone) {
                                            window.location.href = `tel:${member.phone}`;
                                        } else {
                                            alert("No phone number available");
                                        }
                                    }}
                                >
                                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                                    Call
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamManagement;
