import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, FileText, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateReportModal = ({ isOpen, onClose, onSuccess }: CreateReportModalProps) => {
    const { profile } = useAuth();
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim() && files.length === 0) {
            toast.error("Please add some content or files");
            return;
        }
        if (!profile) return;

        setIsSubmitting(true);
        try {
            const uploadedAttachments = [];

            // Upload Files
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
                const filePath = `${profile.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('report-attachments')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('report-attachments')
                    .getPublicUrl(filePath);

                uploadedAttachments.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: publicUrl,
                    path: filePath
                });
            }

            // Insert Report
            // @ts-ignore - daily_reports table not yet in types
            const { error } = await supabase.from('daily_reports').insert({
                user_id: profile.id,
                content: content,
                attachments: uploadedAttachments,
                report_date: new Date().toISOString()
            });

            if (error) throw error;

            toast.success("Report submitted successfully!");
            setContent("");
            setFiles([]);
            onSuccess();
            onClose();

        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon size={16} className="text-blue-500" />;
        if (type.startsWith('video/')) return <Video size={16} className="text-purple-500" />;
        return <FileText size={16} className="text-gray-500" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New Daily Report</DialogTitle>
                    <DialogDescription>
                        Submit your daily progress report with attachments.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>What did you work on today?</Label>
                        <Textarea
                            placeholder="Describe your progress, blockers, or achievements..."
                            className="min-h-[150px] resize-none focus-visible:ring-offset-0 focus-visible:ring-1"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attachments</Label>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="grid grid-cols-1 gap-2 mb-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {getIcon(file.type)}
                                            <span className="truncate max-w-[200px] text-gray-700">{file.name}</span>
                                            <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all text-center"
                        >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">Click to upload files</p>
                            <p className="text-xs text-gray-400 mt-1">Images, Videos, Documents</p>
                        </div>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || (!content && files.length === 0)}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateReportModal;
