import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, MessageCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserProfileScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            setLoading(true);

            // Fetch from Supabase
            // Try fetching by 'id' first (most likely), then 'user_id' if not found?
            let { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                console.log("Profile not found by id, trying user_id...");
                const retry = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", id)
                    .single();
                data = retry.data;
                error = retry.error;
            }

            if (data && !error) {
                const profileData = data as any;
                setProfile({
                    name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.username || "User",
                    avatar: profileData.avatar_url || "https://github.com/shadcn.png",
                    backgroundImage: profileData.background_image,
                    gender: profileData.gender || "N/A",
                    age: profileData.age || "N/A",
                    occupation: profileData.occupation || "N/A",
                    bio: profileData.bio || "No bio yet.",
                    location: profileData.location_city ? `${profileData.location_city}, ${profileData.location_country || ''}` : "Unknown Location",
                    id: profileData.id,
                    school_company: profileData.school_company,
                    level_role: profileData.level_role,
                    lifestyle: profileData.lifestyle,
                    languages: profileData.languages,
                    interests: profileData.interests
                });
            } else {
                console.error("Error fetching profile:", error);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!profile) return <div className="p-8">User not found</div>;

    const author = profile;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            {/* ─── Header Image ─── */}
            <div className="relative h-64 w-full">
                <img
                    src={author.backgroundImage || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />

                {/* Navbar Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-center z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <span className="text-white font-bold text-lg drop-shadow-md shadow-black/50">{author.name}</span>
                    <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
                        <MoreHorizontal size={24} />
                    </button>
                </div>
            </div>

            {/* ─── Profile Info ─── */}
            <div className="px-6 -mt-12 relative z-20">
                <div className="relative inline-block">
                    <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
                    />
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-white"></div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
                        <p className="text-gray-500 font-medium text-lg">
                            {author.gender}, {author.age}
                        </p>
                    </div>

                    {/* Verified/Member Badge (Mock) */}
                    <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-sm font-bold">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>3 y</span>
                    </div>
                </div>

                {/* Location Card */}
                <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</p>
                    <p className="text-lg font-bold text-gray-900">{author.location}</p>
                </div>

                {/* Bio (Optional, using description-like text for now if not valid) */}
                {author.bio && (
                    <div className="mt-4">
                        <p className="text-gray-600 leading-relaxed">
                            {author.bio}
                        </p>
                    </div>
                )}

                {/* Places Listings Link */}
                <button
                    onClick={() => navigate(`/user/${author.id}/places`)}
                    className="mt-6 w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                    <span className="font-bold text-gray-900 text-lg">Places Listings</span>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>

            </div>

            {/* ─── Bottom Action Bar ─── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 safe-area-bottom z-40 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <span className="text-xl font-bold text-gray-900">{author.name}</span>
                <button
                    onClick={() => navigate(`/chat/${author.id}`)}
                    className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors active:scale-95"
                >
                    <MessageCircle size={20} fill="currentColor" />
                    Message
                </button>
            </div>
        </div>
    );
};

export default UserProfileScreen;
