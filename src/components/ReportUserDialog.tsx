import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    reportedUserName: string;
}

const ReportUserDialog = ({ isOpen, onClose, reportedUserId, reportedUserName }: ReportUserDialogProps) => {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user) return;
        if (!reason) {
            toast.error("Please select a reason");
            return;
        }

        setIsSubmitting(true);
        try {
            // Get reporter profile ID
            const { data: reporterProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!reporterProfile) throw new Error("Profile not found");

            // Insert Report
            // @ts-ignore - user_reports table might not be in types yet
            const { error } = await supabase.from('user_reports').insert({
                reporter_id: reporterProfile.id,
                reported_id: reportedUserId,
                reason: reason,
                details: details,
                status: 'pending'
            });

            if (error) throw error;

            toast.success("Report submitted successfully");
            setReason("");
            setDetails("");
            onClose();

        } catch (error) {
            console.error("Report failed:", error);
            toast.error("Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report User</DialogTitle>
                    <DialogDescription>
                        Report {reportedUserName} for inappropriate behavior.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Reason</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="spam">Spam or scam</SelectItem>
                                <SelectItem value="harassment">Harassment or bullying</SelectItem>
                                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                                <SelectItem value="impersonation">Impersonation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Details (Optional)</Label>
                        <Textarea
                            placeholder="Provide more details..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="resize-none h-24"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} variant="destructive">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportUserDialog;
