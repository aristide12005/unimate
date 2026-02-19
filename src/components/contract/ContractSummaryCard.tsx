
import { Calendar, Users, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractSummaryProps {
    hostName: string;
    studentName: string;
    startDate: string;
    rentAmount: number;
    utilitySummary: string;
    address: string;
    status?: 'pending' | 'signed' | 'active';
}

export default function ContractSummaryCard({
    hostName,
    studentName,
    startDate,
    rentAmount,
    utilitySummary,
    address,
    status = 'pending'
}: ContractSummaryProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            {/* Header Pattern */}
            <div className="h-24 bg-gradient-to-r from-primary to-orange-400 relative p-6">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg text-primary">
                    <FileText size={24} />
                </div>
            </div>

            <div className="pt-8 px-6 pb-6 space-y-6">

                {/* Title & Status */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">Co-Living Agreement</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Official Handshake</p>
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        status === 'signed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                        {status}
                    </div>
                </div>

                <hr className="border-dashed border-gray-200" />

                {/* Parties */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium">Host</span>
                        <span className="font-bold text-gray-900">{hostName}</span>
                    </div>
                    <div className="text-gray-300"><Users size={16} /></div>
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-400 font-medium">Student</span>
                        <span className="font-bold text-gray-900">{studentName}</span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                            <Calendar size={14} /> Start Date
                        </div>
                        <p className="font-bold text-gray-900">{startDate}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                            <DollarSign size={14} /> Monthly Total
                        </div>
                        <p className="font-bold text-primary">{rentAmount.toLocaleString()} XOF</p>
                    </div>
                </div>

                {/* Address & Utils */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-900">Property:</span> {address}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-900">Utilities:</span> {utilitySummary}
                        </p>
                    </div>
                </div>

            </div>

            {/* Footer Decoration */}
            <div className="bg-gray-50 p-3 text-center">
                <p className="text-[10px] text-gray-400 font-medium">Powered by uniMate Trust Protocol</p>
            </div>
        </div>
    );
}
