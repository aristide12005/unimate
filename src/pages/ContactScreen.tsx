import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContactScreen = () => {
    const [contactType, setContactType] = useState<"whatsapp" | "phone">("whatsapp");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("phone_number, contact_type")
                .eq("user_id", user.id)
                .single();

            if (data) {
                const profile = data as any;
                if (profile.phone_number) setPhoneNumber(profile.phone_number);
                if (profile.contact_type) setContactType(profile.contact_type);
            }
        };
        fetchProfile();
    }, [user]);

    const handleContinue = async () => {
        if (!user || !phoneNumber) return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                phone_number: phoneNumber,
                contact_type: contactType,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        setSaving(false);

        if (error) {
            toast.error("Failed to save contact info");
        } else {
            navigate("/username");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-5 pb-6">
            {/* Step Indicator */}
            <div className="flex flex-col items-center mt-10 w-full max-w-xs">
                <p className="text-xs font-bold text-foreground tracking-wide">
                    Step 5.5 of 6
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-primary-btn transition-all duration-500"
                        style={{ width: "90%" }}
                    />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-foreground mt-8 text-center leading-tight">
                How should we <span className="text-primary">reach</span> you?
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-[280px]">
                Share your preferred contact method for potential roommates.
            </p>

            {/* Contact Type Selector */}
            <div className="w-full max-w-sm mt-8 flex bg-gray-100 p-1 rounded-2xl">
                <button
                    onClick={() => setContactType("whatsapp")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${contactType === "whatsapp"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <MessageCircle size={18} />
                    WhatsApp
                </button>
                <button
                    onClick={() => setContactType("phone")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${contactType === "phone"
                        ? "bg-white text-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Phone size={18} />
                    Phone Call
                </button>
            </div>

            {/* Phone Number Input */}
            <div className="w-full max-w-sm mt-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    {contactType === "whatsapp" ? "WhatsApp Number" : "Phone Number"}
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        {contactType === "whatsapp" ? (
                            <MessageCircle size={20} className="text-green-500" />
                        ) : (
                            <Phone size={20} className="text-primary" />
                        )}
                    </div>
                    <input
                        type="tel"
                        placeholder="+221 77 000 00 00"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-lg font-bold text-foreground outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 px-1">
                    This will be visible to other roommates on your profile.
                </p>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Navigation Buttons */}
            <div className="w-full max-w-sm mt-auto flex flex-col gap-3">
                <button
                    onClick={handleContinue}
                    disabled={!phoneNumber || saving}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all
                        ${phoneNumber
                            ? "gradient-primary-btn text-primary-foreground shadow-primary/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    {saving ? "Saving..." : "Continue"}
                </button>

            </div>
        </div>
    );
};

export default ContactScreen;
