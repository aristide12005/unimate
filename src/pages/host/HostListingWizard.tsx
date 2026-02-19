
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ListingFormData, INITIAL_HOUSING_RULES } from "@/types/host";
import Step1BasicInfo from "@/components/host/Step1BasicInfo";
import Step2Arrangement from "@/components/host/Step2Arrangement";
import Step3Vibe from "@/components/host/Step3Vibe";
import Step4Preview from "@/components/host/Step4Preview";

const STEPS = [
    { id: 1, title: "The Basics" },
    { id: 2, title: "The Arrangement" },
    { id: 3, title: "The Vibe" },
    { id: 4, title: "Review" }
];

export default function HostListingWizard() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<ListingFormData>({
        title: "",
        type: "Room",
        price: 0,
        location: "",
        description: "",
        features: [],
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", // Default placeholder
        housing_rules: INITIAL_HOUSING_RULES
    });

    const updateFormData = (updates: Partial<ListingFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            navigate(-1);
        }
    };

    const [successId, setSuccessId] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (!user || !profile) {
            toast.error("You must be logged in to post a listing.");
            return;
        }

        setLoading(true);
        try {
            // Create listing with JSONB housing_rules
            const { data, error } = await supabase
                .from('listings')
                .insert({
                    title: formData.title,
                    type: formData.type,
                    price: formData.price.toString(),
                    location: formData.location,
                    description: formData.description,
                    features: formData.features,
                    image: formData.image_url,
                    housing_rules: formData.housing_rules as any, // Cast to any for Json type
                    author_id: profile.id,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Listing published successfully!");
            setSuccessId(data.id);
            // navigate("/profile"); // Removed auto-redirect

        } catch (error: any) {
            console.error("Error publishing listing:", error);
            toast.error(error.message || "Failed to publish listing");
        } finally {
            setLoading(false);
        }
    };

    if (successId) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check size={48} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Live!</h1>
                <p className="text-gray-500 mb-8 max-w-xs">Your listing has been published and is now visible to students.</p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <div className="flex flex-col gap-3 w-full max-w-sm animate-in slide-in-from-bottom-4 duration-700 delay-300">
                        <button
                            onClick={() => navigate(`/listings/${successId}`)}
                            className="w-full py-4 bg-white text-primary rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            View Listing <ArrowRight size={20} />
                        </button>

                        <button
                            onClick={() => navigate(`/user/${profile.id}/places`)}
                            className="w-full py-4 bg-gray-100 text-gray-700 border border-transparent rounded-2xl font-bold text-lg hover:bg-gray-200 active:scale-95 transition-all"
                        >
                            View My Listings
                        </button>
                    </div>
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ... Rest of existing JSX ... */}
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step {currentStep} of {STEPS.length}</span>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">{STEPS[currentStep - 1].title}</h1>
                    </div>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                    {/* Circular Progress Indicator could go here */}
                    <div className="text-xs font-bold text-gray-400">{Math.round((currentStep / STEPS.length) * 100)}%</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-md mx-auto px-5 py-6">
                {currentStep === 1 && (
                    <Step1BasicInfo data={formData} update={updateFormData} />
                )}
                {currentStep === 2 && (
                    <Step2Arrangement data={formData} update={updateFormData} />
                )}
                {currentStep === 3 && (
                    <Step3Vibe data={formData} update={updateFormData} />
                )}
                {currentStep === 4 && (
                    <Step4Preview data={formData} />
                )}
            </div>

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 pb-6 z-50">
                <div className="max-w-md mx-auto flex gap-3">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            currentStep === STEPS.length ? (
                                <>Publish Listing <Check size={20} /></>
                            ) : (
                                <>Continue <ArrowRight size={20} /></>
                            )
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
