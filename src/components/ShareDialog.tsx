import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Facebook, Twitter, MessageCircle, Share2, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareDialogProps {
    children: React.ReactNode;
    title: string;
    description: string;
    url?: string;
}

export const ShareDialog = ({ children, title, description, url = window.location.href }: ShareDialogProps) => {

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <MessageCircle className="w-5 h-5" />, // Proxy for WhatsApp
            color: "bg-[#25D366] hover:bg-[#25D366]/90 text-white",
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, '_blank')
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-5 h-5" />,
            color: "bg-[#1877F2] hover:bg-[#1877F2]/90 text-white",
            action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: "Twitter",
            icon: <Twitter className="w-5 h-5" />,
            color: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white",
            action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(description)}&url=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: "Email",
            icon: <Mail className="w-5 h-5" />,
            color: "bg-gray-600 hover:bg-gray-700 text-white",
            action: () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + "\n\n" + url)}`, '_blank')

        }
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl">
                <DialogHeader>
                    <DialogTitle>Share this listing</DialogTitle>
                    <DialogDescription>
                        Share this place with your friends and family.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {shareLinks.map((link) => (
                            <Button
                                key={link.name}
                                variant="outline"
                                className={`h-14 flex items-center justify-start gap-3 px-4 border-none shadow-sm ${link.color}`}
                                onClick={link.action}
                            >
                                {link.icon}
                                <span className="font-semibold">{link.name}</span>
                            </Button>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Or copy link</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                <span className="text-sm text-gray-500 truncate max-w-[200px]">{url}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCopy}
                                    className="h-8 w-8 p-0"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
