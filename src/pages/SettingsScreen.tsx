
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, FileText, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const SettingsScreen = () => {
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const handleDeleteAccount = async () => {
        try {
            if (!user) return;

            // Open a support email pre-filled with the account deletion request
            const subject = encodeURIComponent("Account Deletion Request");
            const body = encodeURIComponent(
                `Hello uniMate Support,\n\nI would like to permanently delete my account.\n\nUser ID: ${user.id}\nEmail: ${user.email}\n\nPlease confirm once completed.\n\nThank you.`
            );
            window.location.href = `mailto:support@unimate.app?subject=${subject}&body=${body}`;

            toast({
                title: "Request email opened",
                description: "Send the email to complete your deletion request.",
            });
        } catch (error) {
            console.error("Error opening deletion request:", error);
            toast({
                title: "Error",
                description: "Failed to process account deletion.",
                variant: "destructive",
            });
        }
    };

    const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {title}
            </h3>
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
                {children}
            </div>
        </div>
    );

    const SettingsItem = ({
        icon: Icon,
        label,
        onClick,
        value,
        showArrow = true,
        isDestructive = false
    }: {
        icon: any;
        label: string;
        onClick?: () => void;
        value?: React.ReactNode;
        showArrow?: boolean;
        isDestructive?: boolean;
    }) => (
        <div
            onClick={onClick}
            className={`
        flex items-center justify-between p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer
        ${isDestructive ? 'text-destructive hover:bg-destructive/10' : 'text-foreground'}
      `}
        >
            <div className="flex items-center gap-3">
                <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isDestructive ? 'bg-destructive/10' : 'bg-secondary/10'}
        `}>
                    <Icon size={16} className={isDestructive ? 'text-destructive' : 'text-primary'} />
                </div>
                <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value}
                {showArrow && <ChevronRight size={16} className="text-muted-foreground" />}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Settings
                </h1>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 max-w-2xl mx-auto w-full pb-24">

                    <SettingsSection title="Account">
                        <SettingsItem
                            icon={User}
                            label="Edit Profile"
                            onClick={() => navigate("/edit-profile")}
                        />
                        <Separator className="bg-border/50" />
                        <SettingsItem
                            icon={Lock}
                            label="Change Password"
                            onClick={() => navigate("/settings/change-password")}
                        />
                    </SettingsSection>

                    <SettingsSection title="Preferences">
                        <SettingsItem
                            icon={Bell}
                            label="Notifications"
                            value={<Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />}
                            showArrow={false}
                        />
                        <Separator className="bg-border/50" />
                        <SettingsItem
                            icon={Moon}
                            label="Dark Mode"
                            value={<Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />}
                            showArrow={false}
                        />
                    </SettingsSection>

                    <SettingsSection title="Support & Information">
                        <SettingsItem
                            icon={HelpCircle}
                            label="Help Center"
                            onClick={() => navigate("/settings/help")}
                        />
                        <Separator className="bg-border/50" />
                        <SettingsItem
                            icon={Mail}
                            label="Contact Us"
                            onClick={() => navigate("/contact")}
                        />
                        <Separator className="bg-border/50" />
                        <SettingsItem
                            icon={FileText}
                            label="Terms of Service"
                            onClick={() => navigate("/settings/terms")}
                        />
                        <Separator className="bg-border/50" />
                        <SettingsItem
                            icon={Shield}
                            label="Privacy Policy"
                            onClick={() => navigate("/settings/privacy")}
                        />
                        <Separator className="bg-border/50" />
                        <div className="p-4 flex flex-col items-center justify-center opacity-50">
                            <span className="text-xs font-medium text-muted-foreground">Version 1.0.0</span>
                        </div>
                    </SettingsSection>

                    <SettingsSection title="Actions">
                        <SettingsItem
                            icon={LogOut}
                            label="Log Out"
                            isDestructive
                            onClick={handleSignOut}
                            showArrow={false}
                        />
                        <Separator className="bg-border/50" />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div className="flex items-center justify-between p-4 bg-card hover:bg-destructive/10 transition-colors cursor-pointer text-destructive">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive/10">
                                            <Shield size={16} className="text-destructive" />
                                        </div>
                                        <span className="font-medium text-sm">Delete Account</span>
                                    </div>
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SettingsSection>

                </div>
            </ScrollArea>
        </div>
    );
};

export default SettingsScreen;
