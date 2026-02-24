import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
    Plus, Search, Calendar as CalendarIcon,
    CheckCircle2, AlertTriangle, ArrowRightCircle, Smile,
    Frown, Meh
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isSameDay, subDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EmployeeReports = () => {
    const { profile } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [doneToday, setDoneToday] = useState("");
    const [plannedTomorrow, setPlannedTomorrow] = useState("");
    const [blockers, setBlockers] = useState("");
    const [sentiment, setSentiment] = useState("good");

    useEffect(() => {
        if (profile) fetchReports();
    }, [profile]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    id, date, done_today, planned_tomorrow, blockers, sentiment, created_at,
                    employee_id,
                    employee:profiles!employee_id(first_name, last_name, username, avatar_url, job_title, department)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error("Error fetching DARs:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const submitReport = async () => {
        if (!doneToday.trim() || !plannedTomorrow.trim()) {
            toast.error("Please fill in what you did today and plans for tomorrow.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('reports').insert({
                employee_id: profile?.id,
                date: new Date().toISOString().split('T')[0],
                done_today: doneToday,
                planned_tomorrow: plannedTomorrow,
                blockers: blockers.trim() || null,
                sentiment: sentiment
            });

            if (error) throw error;

            toast.success("Daily report submitted successfully!");
            setIsCreateOpen(false);
            setDoneToday("");
            setPlannedTomorrow("");
            setBlockers("");
            setSentiment("good");
            fetchReports();
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const emp = r.employee;
        const name = `${emp?.first_name} ${emp?.last_name}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    const groupedReports = filteredReports.reduce((acc: any, report) => {
        const dateKey = report.date || format(new Date(report.created_at), 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(report);
        return acc;
    }, {});

    const renderSentiment = (s: string) => {
        switch (s) {
            case 'good': return <Smile className="text-green-500 w-5 h-5" />;
            case 'bad': return <Frown className="text-red-500 w-5 h-5" />;
            case 'neutral': default: return <Meh className="text-yellow-500 w-5 h-5" />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Activity Reports (DAR)</h1>
                    <p className="text-gray-500 text-sm">Track daily progress, plans, and team blockers</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Submit Report
                </Button>
            </div>

            <div className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by employee..."
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : Object.keys(groupedReports).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                    </div>
                ) : (
                    Object.entries(groupedReports).sort((a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, dayReports]: [string, any]) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1 flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {isSameDay(new Date(date), new Date()) ? 'Today' :
                                    isSameDay(new Date(date), subDays(new Date(), 1)) ? 'Yesterday' :
                                        format(new Date(date), 'EEEE, MMMM do')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dayReports.map((report: any) => (
                                    <div key={report.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-gray-100">
                                                    <AvatarImage src={report.employee?.avatar_url} />
                                                    <AvatarFallback>{report.employee?.first_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 leading-none">
                                                        {report.employee?.first_name || 'Unknown'} {report.employee?.last_name || ''}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {report.employee?.job_title || 'Employee'} • {report.employee?.department || 'General'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div title="Daily Sentiment">
                                                {renderSentiment(report.sentiment || 'neutral')}
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50">
                                                <div className="flex items-center text-green-700 font-semibold mb-1 text-xs uppercase tracking-wider">
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Done Today
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{report.done_today}</p>
                                            </div>

                                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                                                <div className="flex items-center text-blue-700 font-semibold mb-1 text-xs uppercase tracking-wider">
                                                    <ArrowRightCircle className="w-3.5 h-3.5 mr-1.5" /> Planned for Tomorrow
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{report.planned_tomorrow}</p>
                                            </div>

                                            {report.blockers && (
                                                <div className="bg-red-50/50 p-3 rounded-lg border border-red-100/50">
                                                    <div className="flex items-center text-red-700 font-semibold mb-1 text-xs uppercase tracking-wider">
                                                        <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Blockers
                                                    </div>
                                                    <p className="text-red-900 whitespace-pre-wrap">{report.blockers}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Submit Daily Report</DialogTitle>
                        <DialogDescription>
                            Document your progress to keep the team aligned.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="done" className="font-semibold text-green-700 flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> What did you complete today?
                            </Label>
                            <Textarea
                                id="done"
                                placeholder="E.g. Finished the new login flow, fixed 3 bugs..."
                                value={doneToday}
                                onChange={(e) => setDoneToday(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="planned" className="font-semibold text-blue-700 flex items-center">
                                <ArrowRightCircle className="w-4 h-4 mr-2" /> What's planned for tomorrow?
                            </Label>
                            <Textarea
                                id="planned"
                                placeholder="E.g. Will start on the dashboard API integration..."
                                value={plannedTomorrow}
                                onChange={(e) => setPlannedTomorrow(e.target.value)}
                                className="resize-none"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blockers" className="font-semibold text-red-700 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" /> Any Blockers? (Optional)
                            </Label>
                            <Textarea
                                id="blockers"
                                placeholder="Waiting on design assets, blocked by API issue..."
                                value={blockers}
                                onChange={(e) => setBlockers(e.target.value)}
                                className="resize-none"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label className="font-semibold">How are you feeling today?</Label>
                            <div className="flex gap-4 mt-2">
                                <button type="button" onClick={() => setSentiment('good')} className={cn("p-2 rounded-full transition-all", sentiment === 'good' ? 'bg-green-100 scale-110' : 'hover:bg-gray-100 grayscale hover:grayscale-0')}>
                                    <Smile className="text-green-500 w-8 h-8" />
                                </button>
                                <button type="button" onClick={() => setSentiment('neutral')} className={cn("p-2 rounded-full transition-all", sentiment === 'neutral' ? 'bg-yellow-100 scale-110' : 'hover:bg-gray-100 grayscale hover:grayscale-0')}>
                                    <Meh className="text-yellow-500 w-8 h-8" />
                                </button>
                                <button type="button" onClick={() => setSentiment('bad')} className={cn("p-2 rounded-full transition-all", sentiment === 'bad' ? 'bg-red-100 scale-110' : 'hover:bg-gray-100 grayscale hover:grayscale-0')}>
                                    <Frown className="text-red-500 w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={submitReport} disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeReports;
