import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, AlertTriangle, CheckCircle, Info, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BroadcastDashboard = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("system");
    const [actionUrl, setActionUrl] = useState("");
    const [sending, setSending] = useState(false);

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Title and message are required");
            return;
        }

        if (!confirm("Are you sure you want to send this message to ALL users? This cannot be undone.")) {
            return;
        }

        setSending(true);
        try {
            const { error } = await supabase.rpc('broadcast_message', {
                p_title: title,
                p_message: message,
                p_type: type,
                p_action_url: actionUrl || null
            });

            if (error) throw error;

            toast.success("Broadcast message sent successfully");
            setTitle("");
            setMessage("");
            setActionUrl("");
        } catch (error) {
            console.error("Error sending broadcast:", error);
            toast.error("Failed to send broadcast");
        } finally {
            setSending(false);
        }
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'promotion': return <Megaphone className="h-4 w-4 text-purple-500" />;
            case 'system': return <Info className="h-4 w-4 text-blue-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Broadcast Messages</h1>
                <p className="text-gray-500 text-sm">Send notifications to all users on the platform</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compose Message</CardTitle>
                    <CardDescription>
                        This will create a notification for every user in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Notification Type</label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-500" />
                                        System Update
                                    </div>
                                </SelectItem>
                                <SelectItem value="alert">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                        Important Alert
                                    </div>
                                </SelectItem>
                                <SelectItem value="promotion">
                                    <div className="flex items-center gap-2">
                                        <Megaphone className="h-4 w-4 text-purple-500" />
                                        Announcement / Promotion
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <Input
                            placeholder="e.g., Scheduled Maintenance"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Message Content</label>
                        <Textarea
                            placeholder="Type your message here..."
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Action URL (Optional)</label>
                        <Input
                            placeholder="e.g., /settings or https://example.com"
                            value={actionUrl}
                            onChange={(e) => setActionUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Users will be directed here when they click the notification.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleBroadcast}
                            disabled={sending || !title || !message}
                            className="w-full sm:w-auto"
                        >
                            {sending ? (
                                "Sending..."
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Send Broadcast
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
                <Info className="h-5 w-5 shrink-0" />
                <p>
                    Broadcasts are delivered instantly to the notification center of all users.
                    Push notifications will also be sent if configured.
                </p>
            </div>
        </div>
    );
};

export default BroadcastDashboard;
