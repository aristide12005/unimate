import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, Users, CheckSquare, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface Meeting {
    id: string;
    title: string;
    date: string;
    agenda: any[];
    action_items: any[];
    created_by: string;
}

const MeetingsManager = () => {
    const { profile } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [agendaItems, setAgendaItems] = useState<string[]>([""]);
    const [actionItems, setActionItems] = useState<{ task: string, assignee: string }[]>([{ task: "", assignee: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            setMeetings(data as unknown as Meeting[]);
        } catch (error) {
            console.error("Error fetching meetings:", error);
            toast.error("Failed to load meetings");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAgendaItem = () => setAgendaItems([...agendaItems, ""]);
    const handleUpdateAgendaItem = (index: number, val: string) => {
        const t = [...agendaItems];
        t[index] = val;
        setAgendaItems(t);
    };
    const handleRemoveAgendaItem = (index: number) => {
        setAgendaItems(agendaItems.filter((_, i) => i !== index));
    };

    const handleAddActionItem = () => setActionItems([...actionItems, { task: "", assignee: "" }]);
    const handleUpdateActionItem = (index: number, field: 'task' | 'assignee', val: string) => {
        const t = [...actionItems];
        t[index][field] = val;
        setActionItems(t);
    };
    const handleRemoveActionItem = (index: number) => {
        setActionItems(actionItems.filter((_, i) => i !== index));
    };

    const handleCreateMeeting = async () => {
        if (!title || !date || !time) {
            toast.error("Please provide title, date, and time");
            return;
        }

        setIsSubmitting(true);
        try {
            const dateTimeStr = `${date}T${time}:00Z`; // basic format, ideally rely on timezone 
            const filteredAgenda = agendaItems.filter(a => a.trim() !== "");
            const filteredActions = actionItems.filter(a => a.task.trim() !== "");

            const { error } = await supabase.from('meetings').insert({
                title,
                date: new Date(dateTimeStr).toISOString(),
                agenda: filteredAgenda as unknown as Json,
                action_items: filteredActions as unknown as Json,
                created_by: profile?.id
            });

            if (error) throw error;

            toast.success("Meeting scheduled successfully");
            setIsCreateOpen(false);

            // reset
            setTitle("");
            setDate("");
            setTime("");
            setAgendaItems([""]);
            setActionItems([{ task: "", assignee: "" }]);

            fetchMeetings();
        } catch (error: any) {
            console.error("Error creating meeting:", error);
            toast.error(error.message || "Failed to schedule meeting");
        } finally {
            setIsSubmitting(false);
        }
    };

    const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date());
    const pastMeetings = meetings.filter(m => new Date(m.date) < new Date());

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meetings & Agendas</h1>
                    <p className="text-muted-foreground text-sm">Coordinate synchronous work, agendas, and tracking</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Schedule Meeting
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upcoming Meetings */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center text-gray-800">
                            <CalendarIcon className="w-5 h-5 mr-2 text-primary" /> Upcoming Meetings
                        </h2>
                        {upcomingMeetings.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
                                <CalendarIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                No upcoming meetings scheduled.
                            </div>
                        ) : upcomingMeetings.map((m) => (
                            <MeetingCard key={m.id} meeting={m} isActive={true} />
                        ))}
                    </div>

                    {/* Past Meetings */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center text-gray-500">
                            <CheckSquare className="w-5 h-5 mr-2 text-gray-400" /> Past Notes & Action Items
                        </h2>
                        {pastMeetings.length === 0 ? (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100/50 text-center text-gray-400">
                                No past meetings yet.
                            </div>
                        ) : pastMeetings.map((m) => (
                            <MeetingCard key={m.id} meeting={m} isActive={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule a Meeting</DialogTitle>
                        <DialogDescription>
                            Set the agenda before the meeting to keep everyone aligned.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Meeting Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly All Hands" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-primary flex items-center"><FileText className="w-4 h-4 mr-1" /> Agenda Items</Label>
                                <Button variant="ghost" size="sm" onClick={handleAddAgendaItem} className="h-7 text-xs">+ Add Topic</Button>
                            </div>
                            {agendaItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={e => handleUpdateAgendaItem(idx, e.target.value)}
                                        placeholder={`Topic ${idx + 1}`}
                                        className="bg-orange-50/30 border-orange-100"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAgendaItem(idx)}>
                                        <X className="w-4 h-4 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-blue-600 flex items-center"><CheckSquare className="w-4 h-4 mr-1" /> Pre-assigned Action Items</Label>
                                <Button variant="ghost" size="sm" onClick={handleAddActionItem} className="h-7 text-xs">+ Add Action</Button>
                            </div>
                            {actionItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={item.task}
                                        onChange={e => handleUpdateActionItem(idx, 'task', e.target.value)}
                                        placeholder="Specific task..."
                                        className="flex-1"
                                    />
                                    <Input
                                        value={item.assignee}
                                        onChange={e => handleUpdateActionItem(idx, 'assignee', e.target.value)}
                                        placeholder="@assignee"
                                        className="w-32"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveActionItem(idx)}>
                                        <X className="w-4 h-4 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleCreateMeeting} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Schedule Meeting"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const MeetingCard = ({ meeting, isActive }: { meeting: Meeting, isActive: boolean }) => {
    const agenda = meeting.agenda || [];
    const actions = meeting.action_items || [];

    return (
        <div className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-white shadow-sm hover:shadow-md border-gray-100' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={`font-bold text-lg ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{meeting.title}</h3>
                    <div className="flex items-center text-sm mt-1 text-gray-500 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 mr-1" /> {format(new Date(meeting.date), "MMM d, yyyy")}
                        <span className="mx-2">•</span>
                        <Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(meeting.date), "h:mm a")}
                    </div>
                </div>
            </div>

            {agenda.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Agenda</h4>
                    <ul className="space-y-1.5">
                        {agenda.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-primary mr-2 font-bold">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {actions.length > 0 && (
                <div className="mt-5 bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800/60 mb-2">Target Action Items</h4>
                    <div className="space-y-2">
                        {actions.map((act: any, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm bg-white p-2 border border-blue-50 rounded shadow-sm">
                                <span className="font-medium text-gray-800 truncate">{act.task}</span>
                                {act.assignee && (
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {act.assignee}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingsManager;
