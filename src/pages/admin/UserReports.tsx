import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const UserReports = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_reports')
                .select(`
                    *,
                    reporter:reporter_id(id, first_name, last_name, username, avatar_url),
                    reported:reported_id(id, first_name, last_name, username, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Error fetching user reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            const { error } = await supabase
                .from('user_reports')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            toast.success(`Report marked as ${status}`);
        } catch (error) {
            console.error("Error updating report:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.details?.toLowerCase().includes(search.toLowerCase()) ||
            report.reporter?.username?.toLowerCase().includes(search.toLowerCase()) ||
            report.reported?.username?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
            case 'reviewed': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Reviewed</Badge>;
            case 'acted': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Action Taken</Badge>;
            case 'dismissed': return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Dismissed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
                    <p className="text-gray-500 text-sm">Manage abuse reports and moderation</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search reports..."
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
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="acted">Action Taken</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
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
                                <th className="px-6 py-4">Reported By</th>
                                <th className="px-6 py-4">Reported User</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No reports found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={report.reporter?.avatar_url} />
                                                    <AvatarFallback>{report.reporter?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {report.reporter?.first_name} {report.reporter?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{report.reporter?.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={report.reported?.avatar_url} />
                                                    <AvatarFallback>{report.reported?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {report.reported?.first_name} {report.reported?.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">@{report.reported?.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-medium text-gray-900">{report.reason}</div>
                                            <div className="text-xs text-gray-500 truncate" title={report.details}>
                                                {report.details}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateStatus(report.id, 'reviewed')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Mark Reviewed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus(report.id, 'acted')}>
                                                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" /> Take Action
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => updateStatus(report.id, 'dismissed')}>
                                                        <XCircle className="mr-2 h-4 w-4 text-gray-500" /> Dismiss
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default UserReports;
