import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    { id: 1, title: "The Basics", subtitle: "Tell us about your place", description: "Start with the essentials — what kind of space is it, where is it, and how much does it cost?" },
    { id: 2, title: "Arrangement", subtitle: "Set the house rules", description: "Share the details about utilities, shared spaces, and what tenants should expect." },
    { id: 3, title: "Amenities & Photos", subtitle: "Make it stand out", description: "Highlight what makes your space special and add photos to attract the right tenants." },
    { id: 4, title: "Review", subtitle: "Check everything", description: "Take a final look at your listing before publishing it to students across Dakar." }
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
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        images: [],
        housing_rules: INITIAL_HOUSING_RULES,
        contact_phone: "",
        available_from: "",
    });

    // Check for edit mode
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    useEffect(() => {
        if (!editId || !profile) return;

        const fetchListingToEdit = async () => {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', Number(editId))
                .eq('author_id', profile.id) // Security check
                .single();

            if (data && !error) {
                const row = data as any;
                setFormData({
                    title: row.title,
                    type: row.type,
                    price: Number(row.price_amount) || 0,
                    location: row.location,
                    description: row.description,
                    features: row.features || [],
                    image_url: row.image,
                    images: row.images || [],
                    housing_rules: row.housing_rules || INITIAL_HOUSING_RULES,
                    contact_phone: row.contact_phone || "",
                    available_from: row.available_from || "",
                });
                toast.info("Editing existing listing");
            }
        };
        fetchListingToEdit();
    }, [editId, profile]);

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
            let data, error;

            if (editId) {
                const result = await supabase
                    .from('listings')
                    .update({
                        title: formData.title,
                        type: formData.type,
                        price: formData.price.toString(),
                        price_amount: Number(formData.price),
                        location: formData.location,
                        description: formData.description,
                        features: formData.features,
                        image: formData.image_url,
                        images: formData.images as any,
                        housing_rules: formData.housing_rules as any,
                        ...(formData.contact_phone ? { contact_phone: formData.contact_phone } as any : {}),
                        ...(formData.available_from ? { available_from: formData.available_from } as any : {}),
                    })
                    .eq('id', Number(editId))
                    .select()
                    .single();

                data = result.data;
                error = result.error;
            } else {
                const result = await supabase
                    .from('listings')
                    .insert({
                        title: formData.title,
                        type: formData.type,
                        price: formData.price.toString(),
                        price_amount: Number(formData.price),
                        location: formData.location,
                        description: formData.description,
                        features: formData.features,
                        image: formData.image_url,
                        images: formData.images as any,
                        housing_rules: formData.housing_rules as any,
                        author_id: profile.id,
                        created_at: new Date().toISOString(),
                        ...(formData.contact_phone ? { contact_phone: formData.contact_phone } as any : {}),
                        ...(formData.available_from ? { available_from: formData.available_from } as any : {}),
                    })
                    .select()
                    .single();

                data = result.data;
                error = result.error;
            }

            if (error) throw error;

            toast.success(editId ? "Listing updated successfully!" : "Listing published successfully!");
            setSuccessId(data.id);

        } catch (error: any) {
            console.error("Error publishing listing:", error);
            toast.error(error.message || "Failed to publish listing");
        } finally {
            setLoading(false);
        }
    };

    // ─── Success Screen ───
    if (successId) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Check size={48} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Live!</h1>
                <p className="text-gray-500 mb-8 max-w-xs">Your listing has been updated/published and is visible to students.</p>

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

    const progress = (currentStep / STEPS.length) * 100;
    const step = STEPS[currentStep - 1];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* ─── Airbnb-style thin progress bar ─── */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-1.5 bg-gray-100">
                <div
                    className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500 ease-out rounded-r-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* ─── Desktop: Split-screen layout / Mobile: Stacked ─── */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-screen pt-1.5">

                {/* ─── LEFT PANEL: Context (Desktop only) ─── */}
                <div className="hidden lg:flex lg:w-[40%] xl:w-[35%] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 xl:p-16 flex-col justify-between sticky top-0 h-screen">
                    <div>
                        <button onClick={handleBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors mb-8">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="space-y-2 mb-12">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                                Step {currentStep} of {STEPS.length}
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
                                {step.subtitle}
                            </h1>
                            <p className="text-lg text-gray-400 leading-relaxed mt-4 max-w-md">
                                {step.description}
                            </p>
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="flex items-center gap-3">
                        {STEPS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => s.id < currentStep && setCurrentStep(s.id)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${s.id === currentStep
                                        ? 'w-10 bg-orange-400'
                                        : s.id < currentStep
                                            ? 'w-2.5 bg-green-400 cursor-pointer hover:bg-green-300'
                                            : 'w-2.5 bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* ─── RIGHT PANEL: Form content ─── */}
                <div className="flex-1 flex flex-col">

                    {/* Mobile-only header */}
                    <div className="lg:hidden sticky top-1.5 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                                    <ArrowLeft size={22} />
                                </button>
                                <div>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step {currentStep}</span>
                                    <h1 className="text-base font-bold text-gray-900 leading-tight">{step.title}</h1>
                                </div>
                            </div>
                            {/* Mobile step dots */}
                            <div className="flex items-center gap-1.5">
                                {STEPS.map((s) => (
                                    <div
                                        key={s.id}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${s.id === currentStep
                                                ? 'w-6 bg-primary'
                                                : s.id < currentStep
                                                    ? 'w-1.5 bg-green-400'
                                                    : 'w-1.5 bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── Form Content ─── */}
                    <div className="flex-1 px-5 py-6 lg:px-12 xl:px-16 lg:py-12 lg:overflow-y-auto lg:max-h-[calc(100vh-80px)] lg:mt-1.5">
                        <div className="max-w-2xl">
                            {/* Desktop section title (within form area) */}
                            <div className="hidden lg:block mb-8">
                                <h2 className="text-2xl font-black text-gray-900">{step.title}</h2>
                                <div className="w-10 h-1 bg-primary rounded-full mt-2" />
                            </div>

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
                    </div>

                    {/* ─── Bottom Action Bar (Airbnb-style) ─── */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 z-50">
                        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-4 lg:px-12 xl:px-16">
                            {currentStep > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="text-sm font-bold text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-all"
                                >
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/20 active:scale-[0.97] transition-all flex items-center gap-2 text-sm disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    currentStep === STEPS.length ? (
                                        <>Publish <Check size={18} /></>
                                    ) : (
                                        <>Next <ArrowRight size={18} /></>
                                    )
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
