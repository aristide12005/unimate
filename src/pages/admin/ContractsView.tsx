import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, Filter, FileSignature, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ContractsView = () => {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    host:host_id(id, first_name, last_name, username, avatar_url),
                    student:student_id(id, first_name, last_name, username, avatar_url),
                    listing:listing_id(id, title, city)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContracts(data || []);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Failed to load contracts");
        } finally {
            setLoading(false);
        }
    };

    const filteredContracts = contracts.filter(contract => {
        const matchesSearch =
            contract.host?.username?.toLowerCase().includes(search.toLowerCase()) ||
            contract.student?.username?.toLowerCase().includes(search.toLowerCase()) ||
            contract.listing?.title?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
            case 'active': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Completed</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
            case 'signed': return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Signed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
                    <p className="text-gray-500 text-sm">Manage housing contracts and agreements</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search contracts..."
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-gray-50 border-transparent focus:bg-white">
                            <Filter className="mr-2 h-4 w-4 text-gray-500" />
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="signed">Signed</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Listing</th>
                                <th className="px-6 py-4">Host</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading contracts...
                                    </td>
                                </tr>
                            ) : filteredContracts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No contracts found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {getStatusBadge(contract.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 line-clamp-1">{contract.listing?.title}</div>
                                            <div className="text-xs text-gray-500">{contract.listing?.city}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={contract.host?.avatar_url} />
                                                    <AvatarFallback>{contract.host?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {contract.host?.first_name} {contract.host?.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={contract.student?.avatar_url} />
                                                    <AvatarFallback>{contract.student?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {contract.student?.first_name} {contract.student?.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {format(new Date(contract.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {contract.contract_pdf_url && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a href={contract.contract_pdf_url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4 mr-1" /> PDF
                                                    </a>
                                                </Button>
                                            )}
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

export default ContractsView;
