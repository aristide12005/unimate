import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Bookmark, Share, Send, MapPin, MessageCircle, MoreVertical, Edit, Trash, Images, Heart, ChevronLeft, ChevronRight, Star, Phone, Calendar, Home, Bath, Maximize, ExternalLink } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { toast } from "sonner";
import { ShareDialog } from "@/components/ShareDialog";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompatibility } from "@/hooks/useCompatibility";
import { ListingGallery, GalleryImage } from "@/components/ListingGallery";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { searchLocations } from "@/services/locationService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Dakar neighborhood coordinates ────
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
    "Almadies": [14.7413, -17.5116],
    "Mermoz": [14.7050, -17.4714],
    "Sacré-Cœur": [14.7218, -17.4658],
    "Ouakam": [14.7273, -17.4930],
    "Yoff": [14.7623, -17.4843],
    "Plateau": [14.6697, -17.4381],
    "Liberté 6": [14.7115, -17.4576],
    "HLM": [14.7030, -17.4470],
    "Grand Yoff": [14.7320, -17.4510],
    "Point E": [14.6963, -17.4628],
    "Fann": [14.6930, -17.4710],
    "Médina": [14.6820, -17.4450],
    "Parcelles Assainies": [14.7580, -17.4440],
    "Ngor": [14.7510, -17.5150],
    "Dakar Ponty": [14.6760, -17.4360],
};

const DEFAULT_COORDS: [number, number] = [14.7167, -17.4677]; // Central Dakar

function getListingCoords(location: string): [number, number] | null {
    for (const [name, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
        if (location.toLowerCase().includes(name.toLowerCase())) {
            return coords;
        }
    }
    return null;
}

// ─── Map Component ────
function ListingMap({ location, title, price, lat, lon }: { location: string; title: string; price: string; lat?: number; lon?: number }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        const setupMap = async () => {
            if (!mapRef.current || mapInstance.current) return;

            let coords: [number, number] = DEFAULT_COORDS;

            if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
                coords = [lat, lon];
            } else {
                const known = getListingCoords(location);
                if (known) {
                    coords = known;
                } else {
                    try {
                        const results = await searchLocations(location);
                        if (results && results.length > 0) {
                            coords = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
                        }
                    } catch (e) {
                        console.error('Failed to geocode', e);
                    }
                }
            }
            if (!mapRef.current || mapInstance.current) return;

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView(coords, 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Add zoom control to bottom-right
            L.control.zoom({ position: "bottomright" }).addTo(map);
            L.control.attribution({ position: "bottomleft" }).addTo(map);

            // Custom marker with price bubble
            const priceIcon = L.divIcon({
                className: "custom-price-marker",
                html: `
                <div style="
                    background: white;
                    color: #111827;
                    padding: 8px 14px;
                    border-radius: 24px;
                    font-size: 14px;
                    font-weight: 800;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                    text-align: center;
                    transition: transform 0.2s;
                " class="hover:scale-105">${price}</div>
            `,
                iconSize: [100, 30],
                iconAnchor: [50, 30],
            });

            L.marker(coords, { icon: priceIcon }).addTo(map);

            // Blue circle to show approximate area
            L.circle(coords, {
                radius: 300,
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 2,
            }).addTo(map);

            mapInstance.current = map;
        };

        setupMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [location, title, price, lat, lon]);

    return (
        <div ref={mapRef} className="w-full h-full rounded-2xl" style={{ minHeight: "100%" }} />
    );
}

// ─── Main Component ────
const ListingDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { listings, savedListingIds, toggleSave } = useListings();
    const { user, profile } = useAuth() as any;
    const [requesting, setRequesting] = useState(false);
    const [singleListing, setSingleListing] = useState<any>(null);
    const [loadingSingle, setLoadingSingle] = useState(true);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [activeThumb, setActiveThumb] = useState(0);
    const [showFullDesc, setShowFullDesc] = useState(false);

    const compatibility = useCompatibility(singleListing);

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return;
            const cached = listings.find(l => l.id === Number(id));
            if (cached) { setSingleListing(cached); setLoadingSingle(false); return; }

            const { data, error } = await supabase
                .from('listings')
                .select(`*, author:author_id (id, first_name, last_name, username, avatar_url, background_image, age, gender, bio, occupation, school_company)`)
                .eq('id', Number(id))
                .single();

            if (data) {
                setSingleListing({
                    ...data,
                    author: {
                        id: data.author.id,
                        name: `${data.author.first_name || ''} ${data.author.last_name || ''}`.trim() || data.author.username,
                        avatar: data.author.avatar_url,
                        backgroundImage: data.author.background_image,
                        age: data.author.age, gender: data.author.gender,
                        bio: data.author.bio, occupation: data.author.occupation,
                        school: data.author.school_company
                    },
                    postedAt: new Date(data.created_at).toLocaleDateString()
                });
            }
            setLoadingSingle(false);
        };
        fetchListing();
    }, [id, listings]);

    const handleDelete = async () => {
        if (!singleListing) return;
        try {
            const { error } = await supabase.from('listings').delete().eq('id', singleListing.id);
            if (error) throw error;
            toast.success("Listing deleted");
            navigate(-1);
        } catch { toast.error("Failed to delete"); }
    };

    const handleEdit = () => navigate(`/host/wizard?edit=${singleListing?.id}`);

    const handleRequestArrangement = async () => {
        if (!user || !profile) {
            toast.error("Please log in to book this room");
            navigate('/login', { state: { returnTo: location.pathname } });
            return;
        }
        if (!singleListing) return;
        setRequesting(true);
        try {
            const { error } = await supabase
                .from('contracts' as any)
                .insert({ host_id: singleListing.author.id, student_id: profile.id, listing_id: singleListing.id, terms: singleListing.housing_rules || {}, status: 'pending' })
                .select().single();
            if (error) throw error;
            toast.success("Arrangement Requested!");
            navigate(`/chat/${singleListing.author.id}`);
        } catch { toast.error("Failed to send request"); }
        finally { setRequesting(false); }
    };

    if (loadingSingle) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!singleListing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 font-medium">Listing not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold">Go Back</button>
            </div>
        );
    }

    const listing = singleListing;
    const isSaved = savedListingIds.has(listing.id);
    const shareUrl = window.location.href;
    const shareTitle = `Check out: ${listing.title}`;
    const shareDesc = `${listing.title} in ${listing.location} - ${listing.price}/month`;

    const listingImages = listing.images as GalleryImage[] || [];
    const completeGallery: GalleryImage[] = listingImages.length > 0
        ? (listingImages.some((img: GalleryImage) => img.url === listing.image)
            ? listingImages
            : [{ url: listing.image, category: "Overview" }, ...listingImages])
        : [{ url: listing.image, category: "Overview" }];

    const isOwner = listing && profile && listing.author.id === profile.id;

    const TABS = [
        { id: "overview", label: "Overview" },
        { id: "details", label: "Details" },
        { id: "amenities", label: "Amenities" },
        { id: "map", label: "Location" },
    ];

    const housingRules = listing.housing_rules || {};

    return (
        <div className="min-h-screen bg-white font-sans">

            {/* ─── DESKTOP: Split Layout ─── */}
            <div className="hidden lg:flex h-[calc(100vh-64px)]">

                {/* ─── LEFT: Listing Details ─── */}
                <div className="w-[55%] xl:w-[50%] flex flex-col overflow-y-auto">

                    {/* Top Bar */}
                    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft size={20} className="text-gray-700" />
                            </button>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <button onClick={() => navigate('/listings')} className="hover:text-primary transition-colors">Discover</button>
                                <ChevronRight size={14} />
                                <span className="text-gray-900 font-semibold truncate max-w-[200px]">{listing.title}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/user/${listing.author.id}`)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <span className="text-sm font-semibold text-gray-700 truncate max-w-[100px]">{listing.author.name}</span>
                                <img src={listing.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-8 py-6 space-y-6">

                        {/* Title + Price */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 leading-tight">{listing.title}</h1>
                                <div className="flex items-center gap-2 text-gray-500 mt-2">
                                    <MapPin size={15} className="text-primary" />
                                    <span className="text-sm font-medium">{listing.location}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-3xl font-black text-gray-900">{listing.price}</p>
                                <p className="text-sm text-gray-400 font-medium">Per month</p>
                            </div>
                        </div>

                        {/* Hero Photo + Thumbnails */}
                        <div className="space-y-3">
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
                                <img
                                    src={completeGallery[activeThumb]?.url || listing.image}
                                    alt={listing.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Nav arrows */}
                                {completeGallery.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveThumb(prev => prev > 0 ? prev - 1 : completeGallery.length - 1); }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveThumb(prev => prev < completeGallery.length - 1 ? prev + 1 : 0); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="flex items-center gap-2">
                                {completeGallery.slice(0, 5).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveThumb(i)}
                                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeThumb === i ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                {completeGallery.length > 5 && (
                                    <button onClick={() => setIsGalleryOpen(true)} className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                        +{completeGallery.length - 5}
                                    </button>
                                )}

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* Like + Stats */}
                                <button onClick={() => toggleSave(listing.id)} className={`p-2.5 rounded-full border-2 transition-all ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                                    <Heart size={18} className={isSaved ? 'fill-red-500' : ''} />
                                </button>

                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                        <Home size={16} />
                                        <span className="text-sm font-bold">{listing.type}</span>
                                    </div>
                                </div>

                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={18} className="text-gray-500" /></button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                                            <DropdownMenuItem onClick={handleEdit} className="gap-2"><Edit size={14} /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-600"><Trash size={14} /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 flex gap-6">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab.id
                                        ? 'text-primary'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="space-y-6 pb-8 animate-in fade-in duration-300">
                            {activeTab === "overview" && (
                                <>
                                    {/* Compatibility */}
                                    {compatibility && !compatibility.loading && (
                                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-indigo-900">✨ Compatibility Match</h3>
                                                <p className="text-sm text-indigo-600/80 mt-1 font-medium">
                                                    {compatibility.score >= 80 ? "Great Match!" : compatibility.score >= 50 ? "Good Potential" : "Worth Exploring"}
                                                </p>
                                                <div className="flex gap-1.5 mt-3 flex-wrap">
                                                    {compatibility.matches.slice(0, 3).map((m: string, i: number) => (
                                                        <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-white/60 text-indigo-700 rounded-full border border-indigo-100">{m}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                                                <svg className="w-full h-full transform -rotate-90">
                                                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-100" />
                                                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * compatibility.score) / 100} className="text-indigo-500 transition-all duration-1000" />
                                                </svg>
                                                <span className="absolute text-sm font-black text-indigo-900">{compatibility.score}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <p className={`text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                                            {listing.description}
                                        </p>
                                        {listing.description?.length > 200 && (
                                            <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-primary text-sm font-semibold mt-2 hover:underline">
                                                {showFullDesc ? 'Show less' : 'Read more →'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Author card */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${listing.author.id}`)}>
                                            <img src={listing.author.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                            <div>
                                                <p className="font-bold text-gray-900">{listing.author.name}</p>
                                                <p className="text-xs text-gray-500">{listing.author.occupation || 'Host'} • {listing.postedAt}</p>
                                            </div>
                                        </div>
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                </>
                            )}

                            {activeTab === "details" && (
                                <div className="space-y-4">
                                    {housingRules.utility_modes && (
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-900 mb-4">Utilities</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { label: "⚡ Electricity", val: housingRules.utility_modes.electricity },
                                                    { label: "💧 Water", val: housingRules.utility_modes.water },
                                                    { label: "📶 WiFi", val: housingRules.utility_modes.wifi },
                                                ].map(({ label, val }) => (
                                                    <div key={label} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
                                                        <p className="text-xs font-semibold text-gray-700 capitalize">{val?.replace(/_/g, ' ') || 'Not set'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {housingRules.deposit_amount > 0 && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-sm font-medium text-gray-600">Security Deposit</span>
                                            <span className="text-sm font-bold text-gray-900">{housingRules.deposit_amount?.toLocaleString('fr-SN')} FCFA</span>
                                        </div>
                                    )}
                                    {listing.contact_phone && (
                                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                            <Phone size={18} className="text-green-600" />
                                            <span className="text-sm font-semibold text-green-700">{listing.contact_phone}</span>
                                        </div>
                                    )}
                                    {listing.available_from && (
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <Calendar size={18} className="text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-700">Available from {new Date(listing.available_from).toLocaleDateString("fr-SN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "amenities" && (
                                <div className="grid grid-cols-2 gap-3">
                                    {(listing.features || []).map((f: string) => (
                                        <div key={f} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="text-sm">✓</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">{f}</span>
                                        </div>
                                    ))}
                                    {(!listing.features || listing.features.length === 0) && (
                                        <p className="text-sm text-gray-400 col-span-2">No amenities listed</p>
                                    )}
                                </div>
                            )}

                            {activeTab === "map" && (
                                <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200">
                                    <ListingMap location={listing.location} title={listing.title} price={listing.price} lat={listing.latitude} lon={listing.longitude} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Bottom CTAs */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4 flex items-center gap-3 z-30">
                        {isOwner ? (
                            <div className="flex-1 text-center py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed">You posted this listing</div>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login', { state: { returnTo: location.pathname } });
                                            return;
                                        }
                                        navigate(`/chat/${listing.author.id}`);
                                    }}
                                    className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    <MessageCircle size={18} /> Contact Host
                                </button>
                                <button
                                    onClick={handleRequestArrangement}
                                    disabled={requesting}
                                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-60"
                                >
                                    {requesting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Book <Send size={16} /></>}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT: Map ─── */}
                <div className="flex-1 relative bg-gray-100 border-l border-gray-200">
                    {/* Search bar overlay */}
                    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3">
                        <div className="bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 flex-1">
                            <MapPin size={18} className="text-primary shrink-0" />
                            <span className="text-sm font-semibold text-gray-700 truncate">{listing.location}</span>
                        </div>
                    </div>

                    {/* Price card overlay */}
                    <div className="absolute top-20 left-4 z-[1000] bg-white rounded-2xl shadow-xl p-4 max-w-[240px] border border-gray-100">
                        {listing.image && (
                            <img src={listing.image} alt="" className="w-full h-24 object-cover rounded-xl mb-3" />
                        )}
                        <p className="text-lg font-black text-gray-900">{listing.price}<span className="text-xs font-medium text-gray-400">/mo</span></p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{listing.location}</p>
                        <button
                            onClick={() => setActiveTab("overview")}
                            className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                        >
                            Show details
                        </button>
                    </div>

                    <ListingMap location={listing.location} title={listing.title} price={listing.price} lat={listing.latitude} lon={listing.longitude} />
                </div>
            </div>

            {/* ─── MOBILE: Stacked Layout ─── */}
            <div className="lg:hidden pb-28">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 pt-10 pb-3 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={22} className="text-gray-900" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900">Details</h1>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                if (!user) {
                                    navigate('/login', { state: { returnTo: location.pathname } });
                                    return;
                                }
                                toggleSave(listing.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Bookmark size={22} className={isSaved ? "text-primary fill-primary" : "text-gray-700"} />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={22} className="text-gray-700" /></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl w-48">
                                <ShareDialog title={shareTitle} description={shareDesc} url={shareUrl}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2"><Share size={14} /> Share</DropdownMenuItem>
                                </ShareDialog>
                                {isOwner && (
                                    <>
                                        <DropdownMenuItem onClick={handleEdit} className="gap-2"><Edit size={14} /> Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="gap-2 text-red-600"><Trash size={14} /> Delete</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Hero */}
                <div className="relative aspect-[4/3] bg-gray-100" onClick={() => setIsGalleryOpen(true)}>
                    <img src={completeGallery[activeThumb]?.url || listing.image} alt="" className="w-full h-full object-cover" />
                    {completeGallery.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setActiveThumb(p => p > 0 ? p - 1 : completeGallery.length - 1); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveThumb(p => p < completeGallery.length - 1 ? p + 1 : 0); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                <ChevronRight size={18} />
                            </button>
                        </>
                    )}
                    {/* Image dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {completeGallery.slice(0, 5).map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${activeThumb === i ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`} />
                        ))}
                    </div>
                </div>

                {/* Mobile Thumbnails */}
                <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                    {completeGallery.slice(0, 5).map((img, i) => (
                        <button key={i} onClick={() => setActiveThumb(i)} className={`w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 ${activeThumb === i ? 'border-primary' : 'border-transparent opacity-60'}`}>
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>

                {/* Mobile Content */}
                <div className="px-5 space-y-5">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{listing.type}</span>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight mt-1">{listing.title}</h1>
                        <div className="flex items-center gap-2 text-gray-500 mt-2">
                            <MapPin size={14} className="text-primary" />
                            <span className="text-sm">{listing.location}</span>
                        </div>
                    </div>

                    <p className={`text-gray-600 text-sm leading-relaxed whitespace-pre-wrap ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                        {listing.description}
                    </p>
                    {listing.description?.length > 150 && (
                        <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-primary text-sm font-semibold">
                            {showFullDesc ? 'Show less' : 'Read more →'}
                        </button>
                    )}

                    {/* Amenities */}
                    {listing.features?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Amenities</h3>
                            <div className="flex flex-wrap gap-2">
                                {listing.features.map((f: string) => (
                                    <span key={f} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{f}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Map */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Location</h3>
                        <div className="h-[200px] rounded-2xl overflow-hidden border border-gray-200">
                            <ListingMap location={listing.location} title={listing.title} price={listing.price} lat={listing.latitude} lon={listing.longitude} />
                        </div>
                    </div>

                    {/* Host card */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100" onClick={() => navigate(`/user/${listing.author.id}`)}>
                        <img src={listing.author.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{listing.author.name}</p>
                            <p className="text-xs text-gray-500">{listing.author.occupation || 'Host'}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 pb-safe-bottom z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div>
                            <p className="text-xl font-black text-gray-900">{listing.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                        </div>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-bold rounded-lg text-xs">{listing.type}</span>
                    </div>
                    <div className="flex gap-3">
                        {isOwner ? (
                            <div className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm text-center cursor-not-allowed">You posted this</div>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login', { state: { returnTo: location.pathname } });
                                            return;
                                        }
                                        navigate(`/chat/${listing.author.id}`);
                                    }}
                                    className="py-3 px-5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
                                >
                                    <MessageCircle size={18} /> Contact
                                </button>
                                <button onClick={handleRequestArrangement} disabled={requesting} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition-all disabled:opacity-60">
                                    {requesting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Book <Send size={16} /></>}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery Modal */}
            <ListingGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={completeGallery}
                initialCategory="All"
            />
        </div>
    );
};

export default ListingDetailsScreen;
