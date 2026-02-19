
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import JSConfetti from 'js-confetti';

import ContractSummaryCard from "@/components/contract/ContractSummaryCard";
import SlideToAccept from "@/components/contract/SlideToAccept";
import { ContractService } from "@/services/ContractService";
import { useAuth } from "@/contexts/AuthContext";

export default function ContractRequestScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadContract();
    }, [id]);

    const loadContract = async () => {
        const { data, error } = await ContractService.getContract(id!);
        if (error) {
            toast.error("Failed to load contract");
            navigate(-1);
            return;
        }
        setContract(data);
        setLoading(false);
    };

    const handleSign = async () => {
        setSigning(true);
        const { error } = await ContractService.signContract(id!);

        if (error) {
            toast.error("Signing failed. Please try again.");
            setSigning(false);
        } else {
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();
            toast.success("Contract Signed! Welcome home.");
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    if (!contract) return null;

    const rules = contract.listing.housing_rules;
    const utilitySummary = Object.entries(rules.utility_modes)
        .map(([k, v]: any) => `${k}: ${v === 'included' ? 'Included' : 'Paid'}`)
        .join(' • ');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 flex items-center gap-4 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="font-bold text-lg">Review Agreement</h1>
            </div>

            <div className="p-5 space-y-8 max-w-md mx-auto">
                {/* Visual Contract */}
                <ContractSummaryCard
                    hostName={`${contract.host.first_name} ${contract.host.last_name}`}
                    studentName={`${contract.student.first_name} ${contract.student.last_name}`}
                    startDate={new Date(contract.created_at).toLocaleDateString()}
                    rentAmount={parseInt(contract.listing.price)}
                    utilitySummary={utilitySummary}
                    address={contract.listing.location}
                    status={contract.status}
                />

                {/* Handshake Area */}
                {contract.status === 'pending' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                By sliding, you agree to the <span className="text-primary font-bold">House Rules</span> and <span className="text-primary font-bold">Payment Terms</span>.
                            </p>
                        </div>
                        <SlideToAccept
                            onConfirm={handleSign}
                            isLoading={signing}
                            label="Slide to Sign Contract"
                            confirmedLabel="Signed!"
                            isConfirmed={contract.status === 'signed'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
