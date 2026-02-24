
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const SupportPageLayout = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                </Button>
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-6 max-w-2xl mx-auto w-full prose dark:prose-invert">
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
};

export const HelpCenterScreen = () => (
    <SupportPageLayout title="Help Center">
        <h3>Frequently Asked Questions</h3>
        <p><strong>How do I list a room?</strong><br />Go to your profile and click "Post a Room". Follow the steps in the wizard.</p>
        <p><strong>Is uniMate free?</strong><br />Yes! uniMate is free for students.</p>
        <p><strong>How do I contact support?</strong><br />You can use the "Contact Us" form in the settings.</p>
    </SupportPageLayout>
);

export const TermsOfServiceScreen = () => (
    <SupportPageLayout title="Terms of Service">
        <p>Last updated: February 2026</p>
        <p>By using uniMate, you agree to these terms. Please read them carefully.</p>
        <h4>1. Acceptance of Terms</h4>
        <p>By accessing or using our service, you agree to be bound by these Terms.</p>
        <h4>2. User Accounts</h4>
        <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</p>
        {/* Add more terms as needed */}
    </SupportPageLayout>
);

export const PrivacyPolicyScreen = () => (
    <SupportPageLayout title="Privacy Policy">
        <p>Last updated: February 2026</p>
        <h4>1. Information We Collect</h4>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or post a listing.</p>
        <h4>2. How We Use Information</h4>
        <p>We use the information we collect to provide, maintain, and improve our services, detecting and preventing fraud, and communicating with you.</p>
        {/* Add more privacy policy details as needed */}
    </SupportPageLayout>
);
