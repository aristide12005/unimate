import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Plus, Calendar, FileText, Download, Image as ImageIcon, File, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isSameDay, subDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CreateReportModal from "@/components/admin/reports/CreateReportModal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ReportsDashboard = () => {
    const { profile } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("all"); // all, today, yesterday, week
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        if (profile) fetchReports();
    }, [profile]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const { data, error } = await supabase
                .from('daily_reports')
                .select(`
                    *,
                    user:user_id(id, first_name, last_name, username, avatar_url, position)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const filterReports = (reports: any[]) => {
        return reports.filter(report => {
            // Search Filter
            const name = `${report.user?.first_name} ${report.user?.last_name}`.toLowerCase();
            const username = report.user?.username?.toLowerCase() || "";
            const matchesSearch = name.includes(search.toLowerCase()) || username.includes(search.toLowerCase());

            if (!matchesSearch) return false;

            // Date Filter
            const reportDate = new Date(report.created_at);
            const today = new Date();

            if (filterDate === 'today') {
                return isSameDay(reportDate, today);
            }
            if (filterDate === 'yesterday') {
                return isSameDay(reportDate, subDays(today, 1));
            }
            if (filterDate === 'week') {
                return isWithinInterval(reportDate, {
                    start: startOfWeek(today),
                    end: endOfWeek(today)
                });
            }

            return true;
        });
    };

    const filteredReports = filterReports(reports);

    // Group by Date for cleaner UI
    const groupedReports = filteredReports.reduce((acc: any, report) => {
        const dateKey = format(new Date(report.created_at), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(report);
        return acc;
    }, {});

    const renderAttachmentIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon size={14} className="text-blue-500" />;
        if (type.startsWith('video/')) return <Video size={14} className="text-purple-500" />;
        return <File size={14} className="text-gray-500" />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
                    <p className="text-gray-500 text-sm">Track team progress and updates</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> New Report
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by team member..."
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="bg-gray-50 border-transparent focus:bg-white">
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <SelectValue placeholder="Filter by Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : Object.entries(groupedReports).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new report.</p>
                    </div>
                ) : (
                    Object.entries(groupedReports).sort((a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, dayReports]: [string, any]) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">
                                {isSameDay(new Date(date), new Date()) ? 'Today' :
                                    isSameDay(new Date(date), subDays(new Date(), 1)) ? 'Yesterday' :
                                        format(new Date(date), 'EEEE, MMMM do')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {dayReports.map((report: any) => (
                                    <div key={report.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-10 w-10 border border-gray-100">
                                                <AvatarImage src={report.user?.avatar_url} />
                                                <AvatarFallback>{report.user?.first_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {report.user?.first_name} {report.user?.last_name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 font-medium mb-2">
                                                            {report.user?.position || 'Team Member'} • {format(new Date(report.created_at), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-3 rounded-lg border border-gray-50">
                                                    {report.content}
                                                </div>

                                                {/* Attachments */}
                                                {report.attachments && report.attachments.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        {report.attachments.map((file: any, idx: number) => (
                                                            <a
                                                                key={idx}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                                            >
                                                                {renderAttachmentIcon(file.type)}
                                                                <span className="truncate max-w-[150px]">{file.name}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CreateReportModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchReports}
            />
        </div>
    );
};

export default ReportsDashboard;
