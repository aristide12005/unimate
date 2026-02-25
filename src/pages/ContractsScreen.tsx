import { useState, useEffect } from "react";
import { ArrowLeft, CheckCheck, MapPin, X, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ContractsScreen = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const fetchContracts = async () => {
            try {
                // Fetch contracts where the user is either the host or the seeker
                // Note: supabase-js doesn't easily do deep OR joins for different columns, 
                // so we fetch all where user is involved, then fetch profiles manually if needed.
                const { data, error } = await supabase
                    .from('contracts')
                    .select(`
                        *,
                        listings (
                            id,
                            title,
                            location,
                            image,
                            price
                        ),
                        host:profiles!contracts_host_id_fkey (id, first_name, last_name, avatar_url),
                        seeker:profiles!contracts_seeker_id_fkey (id, first_name, last_name, avatar_url)
                    `)
                    .or(`host_id.eq.${user.id},seeker_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setContracts(data || []);
            } catch (error) {
                console.error("Error fetching contracts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, [user]);

    const handleViewContract = (contract: any) => {
        setSelectedContract(contract);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-4 pt-12 shadow-sm sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900">My Contracts</h1>
                </div>
            </div>

            {/* List */}
            <div className="px-5 py-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : contracts.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="text-primary" size={36} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Contracts Yet</h2>
                        <p className="text-gray-500 mb-8 max-w-[280px] mx-auto">
                            When you finalize rules and lock a listing with someone in the chat, your agreements will appear here.
                        </p>
                        <Button
                            onClick={() => navigate('/home')}
                            className="w-full h-12 rounded-xl text-base font-bold"
                        >
                            Find a Room
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contracts.map((contract) => {
                            const isHost = contract.host_id === user?.id;
                            const otherParty = isHost ? contract.seeker : contract.host;
                            const roleLabel = isHost ? "Hosting" : "Seeking";
                            const listing = contract.listings;

                            return (
                                <div
                                    key={contract.id}
                                    onClick={() => handleViewContract(contract)}
                                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-primary/30 transition-colors"
                                >
                                    {/* Top Row: Listing Info */}
                                    {listing && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={listing.image}
                                                alt={listing.title}
                                                className="w-16 h-16 rounded-xl object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm">
                                                        {roleLabel}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${contract.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                                                        {contract.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 truncate text-sm">{listing.title}</h3>
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                                    <MapPin size={10} /> {listing.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 w-full" />

                                    {/* Bottom Row: User & Date */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={otherParty?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                            />
                                            <p className="text-sm font-medium text-gray-700">
                                                With {otherParty?.first_name}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {format(new Date(contract.created_at), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contract Detail Modal */}
            {selectedContract && (
                <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
                    <DialogContent className="sm:max-w-md rounded-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-black">
                                <CheckCheck className="text-primary" /> Agreement Details
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-2 flex flex-col gap-6">
                            {/* Listing summary */}
                            {selectedContract.listings && (
                                <div className="bg-gray-50 rounded-2xl p-3 flex gap-3 items-center">
                                    <img
                                        src={selectedContract.listings.image}
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 line-clamp-1">{selectedContract.listings.title}</p>
                                        <p className="text-primary font-semibold text-sm">{selectedContract.listings.price}/month</p>
                                    </div>
                                </div>
                            )}

                            {/* Rules List */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider px-1">Agreed Rules</h4>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    {!selectedContract.agreed_rules || selectedContract.agreed_rules.length === 0 ? (
                                        <p className="text-gray-400 italic text-sm">No specific rules were logged for this contract.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {selectedContract.agreed_rules.map((condition: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <div className="bg-green-100 p-1 rounded-full shrink-0 mt-0.5">
                                                        <CheckCheck size={12} className="text-green-600" />
                                                    </div>
                                                    <span className="leading-snug">{condition}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => setSelectedContract(null)}
                                variant="outline"
                                className="w-full rounded-xl"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default ContractsScreen;
