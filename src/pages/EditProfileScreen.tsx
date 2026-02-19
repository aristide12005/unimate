import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Save, MapPin, Briefcase, GraduationCap, Phone, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AsyncSelect } from "@/components/ui/async-select";
import { searchUniversities, University } from "@/services/universityService";
import { searchLocations, Location as NominatimLocation } from "@/services/locationService";

interface ProfileData {
    first_name: string;
    last_name: string;
    username: string;
    bio: string;
    avatar_url: string | null;
    occupation: "student" | "professional" | null;
    school_company: string;
    level_role: string;
    location_city: string;
    location_country: string;
    campus: string;
    interests: string[];
    phone_number: string;
    contact_type: "whatsapp" | "phone";
    lifestyle: {
        smoke: string;
        pets: string;
        schedule: string;
        guests: string;
        cleanliness: string;
    };
    languages: string[];
}

const INTERESTS_OPTIONS = [
    { id: "sports", label: "Sports", emoji: "⚽", color: "bg-orange-100 text-orange-700 border-orange-200", selectedColor: "bg-orange-400 text-white border-orange-400" },
    { id: "music", label: "Music", emoji: "🎵", color: "bg-pink-100 text-pink-700 border-pink-200", selectedColor: "bg-pink-400 text-white border-pink-400" },
    { id: "reading", label: "Reading", emoji: "📚", color: "bg-amber-100 text-amber-700 border-amber-200", selectedColor: "bg-amber-400 text-white border-amber-400" },
    { id: "movies", label: "Movies & TV", emoji: "🎬", color: "bg-purple-100 text-purple-700 border-purple-200", selectedColor: "bg-purple-400 text-white border-purple-400" },
    { id: "travel", label: "Travel", emoji: "✈️", color: "bg-rose-100 text-rose-700 border-rose-200", selectedColor: "bg-rose-400 text-white border-rose-400" },
    { id: "fitness", label: "Yoga & Fitness", emoji: "🧘", color: "bg-teal-100 text-teal-700 border-teal-200", selectedColor: "bg-teal-400 text-white border-teal-400" },
    { id: "gadgets", label: "Gadgets", emoji: "🎮", color: "bg-violet-100 text-violet-700 border-violet-200", selectedColor: "bg-violet-400 text-white border-violet-400" },
    { id: "pets", label: "Pets", emoji: "🐾", color: "bg-cyan-100 text-cyan-700 border-cyan-200", selectedColor: "bg-cyan-400 text-white border-cyan-400" },
    { id: "volunteering", label: "Volunteering", emoji: "💚", color: "bg-green-100 text-green-700 border-green-200", selectedColor: "bg-green-400 text-white border-green-400" },
    { id: "coffee", label: "Coffee Lover", emoji: "☕", color: "bg-orange-100 text-orange-700 border-orange-200", selectedColor: "bg-orange-400 text-white border-orange-400" },
    { id: "outdoors", label: "Outdoors", emoji: "🌿", color: "bg-emerald-100 text-emerald-700 border-emerald-200", selectedColor: "bg-emerald-400 text-white border-emerald-400" },
    { id: "languages", label: "Languages", emoji: "🌍", color: "bg-blue-100 text-blue-700 border-blue-200", selectedColor: "bg-blue-400 text-white border-blue-400" },
    { id: "writing", label: "Writing", emoji: "✍️", color: "bg-rose-100 text-rose-700 border-rose-200", selectedColor: "bg-rose-400 text-white border-rose-400" },
    { id: "cooking", label: "Cooking", emoji: "🍳", color: "bg-amber-100 text-amber-700 border-amber-200", selectedColor: "bg-amber-400 text-white border-amber-400" },
    { id: "gaming", label: "Gaming", emoji: "🕹️", color: "bg-indigo-100 text-indigo-700 border-indigo-200", selectedColor: "bg-indigo-400 text-white border-indigo-400" },
    { id: "art", label: "Art & Design", emoji: "🎨", color: "bg-pink-100 text-pink-700 border-pink-200", selectedColor: "bg-pink-400 text-white border-pink-400" },
    { id: "photography", label: "Photography", emoji: "📸", color: "bg-slate-100 text-slate-700 border-slate-200", selectedColor: "bg-slate-400 text-white border-slate-400" },
];

const EditProfileScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Form State
    const [formData, setFormData] = useState<ProfileData>({
        first_name: "",
        last_name: "",
        username: "",
        bio: "",
        avatar_url: null,
        occupation: null,
        school_company: "",
        level_role: "",
        location_city: "",
        location_country: "",
        campus: "",
        interests: [],
        phone_number: "",
        contact_type: "whatsapp",
        lifestyle: {
            smoke: "",
            pets: "",
            schedule: "",
            guests: "",
            cleanliness: ""
        },
        languages: []
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (data && !error) {
                setFormData({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    username: data.username || "",
                    bio: data.bio || "",
                    avatar_url: data.avatar_url || null,
                    occupation: data.occupation as any,
                    school_company: data.school_company || "",
                    level_role: data.level_role || "",
                    location_city: data.location_city || "",
                    location_country: data.location_country || "",
                    campus: data.campus || "",
                    interests: data.interests || [],
                    phone_number: (data as any).phone_number || "", // Cast to any if types are outdated
                    contact_type: (data as any).contact_type || "whatsapp",
                    lifestyle: (data as any).lifestyle || {
                        smoke: "",
                        pets: "",
                        schedule: "",
                        guests: "",
                        cleanliness: ""
                    },
                    languages: (data as any).languages || []
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [user]);

    const handleBack = () => navigate(-1);

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        // Optimistic update
        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, avatar_url: objectUrl }));

        const filePath = `${user.id}/avatar.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

        if (uploadError) {
            toast.error("Avatar upload failed");
            setUploadingAvatar(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

        // Update database immediately for avatar
        const { error: dbError } = await supabase.from("profiles").update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
        }).eq('user_id', user.id);

        if (dbError) {
            toast.error("Failed to update profile picture");
        } else {
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("Profile picture updated");
        }

        setUploadingAvatar(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                bio: formData.bio,
                occupation: formData.occupation,
                school_company: formData.school_company,
                level_role: formData.level_role,
                location_city: formData.location_city,
                location_country: formData.location_country,
                campus: formData.campus,
                interests: formData.interests,
                phone_number: formData.phone_number,
                contact_type: formData.contact_type,
                lifestyle: formData.lifestyle,
                languages: formData.languages,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        setSaving(false);

        if (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } else {
            toast.success("Profile updated successfully");
            navigate("/profile");
        }
    };

    const toggleInterest = (id: string) => {
        setFormData(prev => {
            const current = new Set(prev.interests);
            if (current.has(id)) current.delete(id);
            else current.add(id);
            return { ...prev, interests: Array.from(current) };
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 bg-white flex items-center gap-3 sticky top-0 z-10">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-32 h-6" />
                </div>
                <div className="p-5 space-y-6">
                    <div className="flex justify-center"><Skeleton className="w-24 h-24 rounded-full" /></div>
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-32" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-10 font-sans">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <button onClick={handleBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={18} className="text-foreground" />
                </button>
                <h1 className="text-lg font-black text-foreground">Edit Profile</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-lg mx-auto w-full space-y-8">

                    {/* AVATAR SECTION */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                            >
                                {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-semibold">Tap to change photo</p>
                    </div>

                    {/* BASIC INFO */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Basic Info</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">First Name</label>
                                <input
                                    value={formData.first_name}
                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Last Name</label>
                                <input
                                    value={formData.last_name}
                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-3 pl-8 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-medium min-h-[80px] resize-none"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>
                    </div>

                    {/* OCCUPATION */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Briefcase size={16} /> Occupation
                        </h2>

                        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                            <button
                                onClick={() => setFormData({ ...formData, occupation: "student" })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.occupation === "student" ? "bg-white shadow text-primary" : "text-gray-400"}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, occupation: "professional" })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.occupation === "professional" ? "bg-white shadow text-secondary" : "text-gray-400"}`}
                            >
                                Professional
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                {formData.occupation === "student" ? "School / University" : "Company / Organization"}
                            </label>
                            {formData.occupation === "student" ? (
                                <AsyncSelect
                                    value={formData.school_company}
                                    onChange={(val) => setFormData({ ...formData, school_company: val })}
                                    onSelect={(item: University) => setFormData({ ...formData, school_company: item.name })}
                                    fetcher={searchUniversities}
                                    getLabel={(item: University) => item.name}
                                    renderOption={(item: University) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap size={14} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.country}</p>
                                            </div>
                                        </div>
                                    )}
                                    placeholder="Search university..."
                                    icon={GraduationCap}
                                    className="w-full"
                                />
                            ) : (
                                <input
                                    value={formData.school_company}
                                    onChange={e => setFormData({ ...formData, school_company: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                    placeholder="Google, Apple..."
                                />
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                {formData.occupation === "student" ? "Level / Year" : "Role / Title"}
                            </label>
                            <input
                                value={formData.level_role}
                                onChange={e => setFormData({ ...formData, level_role: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                placeholder={formData.occupation === "student" ? "Year 3, Master's..." : "Senior Designer..."}
                            />
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <MapPin size={16} /> Location
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">City</label>
                                <AsyncSelect
                                    value={formData.location_city}
                                    onChange={(val) => setFormData({ ...formData, location_city: val })}
                                    onSelect={(item: NominatimLocation) => {
                                        const parts = item.display_name.split(',').map(p => p.trim());
                                        const city = parts[0];
                                        const country = parts[parts.length - 1]; // Heuristic
                                        setFormData({
                                            ...formData,
                                            location_city: city,
                                            location_country: country
                                        });
                                    }}
                                    fetcher={searchLocations}
                                    getLabel={(item: NominatimLocation) => item.display_name.split(',')[0]}
                                    renderOption={(item: NominatimLocation) => (
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">
                                                    {item.display_name.split(',')[0]}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {item.display_name}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    placeholder="Search city..."
                                    icon={MapPin}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Country</label>
                                <input
                                    value={formData.location_country}
                                    onChange={e => setFormData({ ...formData, location_country: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                    placeholder="USA"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Campus (Optional)</label>
                            <input
                                value={formData.campus}
                                onChange={e => setFormData({ ...formData, campus: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                placeholder="Main Campus"
                            />
                        </div>
                    </div>


                    {/* CONTACT INFO */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Phone size={16} /> Contact Info
                        </h2>

                        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                            <button
                                onClick={() => setFormData({ ...formData, contact_type: "whatsapp" })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.contact_type === "whatsapp" ? "bg-white shadow text-green-600" : "text-gray-400"}`}
                            >
                                <MessageCircle size={16} /> WhatsApp
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, contact_type: "phone" })}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.contact_type === "phone" ? "bg-white shadow text-primary" : "text-gray-400"}`}
                            >
                                <Phone size={16} /> Phone
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Number</label>
                            <input
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                                placeholder="+221 77 000 00 00"
                            />
                        </div>
                    </div>

                    {/* LIFESTYLE */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Lifestyle & Habits
                        </h2>

                        {/* Smoking */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Smoking Habits</label>
                            <div className="flex gap-2">
                                {['Non-smoker', 'Smoker', 'Outside only'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, smoke: opt } })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${formData.lifestyle.smoke === opt ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pets */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Pets</label>
                            <div className="flex gap-2">
                                {['No pets', 'Has pets', 'Likes pets'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, pets: opt } })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${formData.lifestyle.pets === opt ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Daily Schedule</label>
                            <div className="flex gap-2">
                                {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, schedule: opt } })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${formData.lifestyle.schedule === opt ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guests */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Guests Frequency</label>
                            <div className="flex gap-2">
                                {['Never', 'Occasional', 'Frequent'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, guests: opt } })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${formData.lifestyle.guests === opt ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cleanliness */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-2 block">Cleanliness</label>
                            <div className="flex gap-2">
                                {['Messy', 'Average', 'Neat Freak'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, cleanliness: opt } })}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${formData.lifestyle.cleanliness === opt ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LANGUAGES */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Languages</h2>
                        <input
                            value={formData.languages.join(", ")}
                            onChange={(e) => setFormData({ ...formData, languages: e.target.value.split(",").map(s => s.trim()) })}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm font-bold"
                            placeholder="English, French, Wolof..."
                        />
                        <p className="text-xs text-gray-400">Separate with commas</p>
                    </div>

                    {/* INTERESTS */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap size={16} /> Interests
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {INTERESTS_OPTIONS.map((interest) => {
                                const isSelected = formData.interests.includes(interest.id);
                                return (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                            border transition-all duration-200 active:scale-95
                                            ${isSelected ? interest.selectedColor : "bg-gray-50 text-gray-600 border-gray-200"}
                                        `}
                                    >
                                        <span>{interest.emoji}</span>
                                        <span>{interest.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditProfileScreen;
