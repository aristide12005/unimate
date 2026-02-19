import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin } from "lucide-react";
import { MOCK_LISTINGS } from "@/data/mockData";

const UserListingsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userListings, setUserListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            if (!id) return;

            // Check if it's strictly the mock user ID (assuming standard mock ID is 123 or similar known mocks)
            // Otherwise, treat everything as potential Supabase ID to avoid hiding real data that happens to have numeric ID.
            // Actually, best approach: Try Supabase first. If no results/error, THEN maybe check mocks (or just show empty).
            // But let's stick to the user's fix: "Remove the isMockId logic and just fetch from Supabase".

            setLoading(true);

            // Fetch from Supabase
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    author:author_id (
                        id,
                        first_name,
                        last_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('author_id', id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching user listings:", error);
                // Optionally fallback to mocks here if truly needed, but safer to show empty/error state for real app.
            }

            if (data) {
                const formattedData = data.map(item => {
                    // Safe fallback for null author (RLS restricted)
                    const author = item.author || {
                        id: 'unknown',
                        first_name: 'Unknown',
                        last_name: 'User',
                        username: 'unknown',
                        avatar_url: null
                    };

                    return {
                        ...item,
                        author: {
                            id: author.id,
                            name: `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.username,
                            avatar: author.avatar_url
                        },
                        postedAt: new Date(item.created_at).toLocaleDateString()
                    };
                });
                setUserListings(formattedData);
            }
            setLoading(false);
        };
        fetchListings();
    }, [id]);

    const author = userListings[0]?.author;

    return (
        <div className="min-h-screen bg-white font-sans pb-10">
            {/* ─── Header ─── */}
            <div className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 flex items-center gap-3 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <XIcon className="w-6 h-6 text-primary" />
                </button>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Places</h1>
            </div>

            {/* ─── Listings Feed ─── */}
            <div className="px-4 pt-4 space-y-6">
                {userListings.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No listings found for this user.</div>
                ) : (
                    userListings.map((listing) => (
                        <div
                            key={listing.id}
                            onClick={() => navigate(`/listings/${listing.id}`)}
                            className="group cursor-pointer"
                        >
                            {/* Image Card */}
                            <div className="relative h-64 w-full rounded-[1.5rem] overflow-hidden bg-gray-200 shadow-sm mb-3">
                                <img
                                    src={listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Author Row (Mini) */}
                            <div className="flex items-center gap-2 mb-1">
                                <img src={listing.author.avatar} alt={author?.name} className="w-5 h-5 rounded-full object-cover" />
                                <span className="text-sm font-medium text-gray-600">{listing.author.name}</span>
                            </div>

                            {/* Details */}
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                {listing.title}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
                                <span>{listing.distance}</span>
                                <span className="text-gray-300">|</span>
                                <div>{listing.location}</div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-lg font-bold text-primary">{listing.price}</span>
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                                    {listing.type}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Helper component for the X icon since we used arrow left in header but design often uses X for modals
// Actually design shows "X" for fullscreen modals but arrow for nav. Sticking to ArrowLeft aka "Back" as it's deeper nav.
// Wait, looking at reference image 2: It shows an "X" icon for "Places".
// Let's use X.
const XIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);


export default UserListingsScreen;
