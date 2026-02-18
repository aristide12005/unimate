import { ReactNode, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import IOSInstallPrompt from "./IOSInstallPrompt";

interface MobileWrapperProps {
    children: ReactNode;
}

const MobileWrapper = ({ children }: MobileWrapperProps) => {
    const [showQR, setShowQR] = useState(false);
    const location = useLocation();

    // Use the specific network IP provided by the user for the QR code
    const currentUrl = "http://192.168.1.18:4173/";

    // If on admin routes, render children directly (Desktop View)
    if (location.pathname.startsWith("/admin")) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center">
            {/* Mobile Frame */}
            <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
                {children}
            </div>

            {/* Desktop Only: QR Code Button */}
            <div className="hidden md:flex flex-col items-center fixed right-8 top-1/2 -translate-y-1/2 gap-4">
                <button
                    onClick={() => setShowQR(true)}
                    className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-primary border border-gray-100 hover:scale-110 transition-transform relative group"
                >
                    <Smartphone size={28} />
                    <span className="absolute right-full mr-4 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Preview on Mobile
                    </span>
                </button>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                        >
                            <X size={18} />
                        </button>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-foreground mb-2">Scan to Preview</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Open your phone's camera and scan this code to view the app on your device.
                            </p>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner inline-block relative">
                                <QRCodeSVG
                                    value={currentUrl}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {/* Optional center logo if needed */}
                                </div>
                            </div>

                            <div className="mt-6 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg text-left">
                                <strong>Tip:</strong> Make sure your phone and computer are on the same Wi-Fi network. If the QR code points to <code>localhost</code>, manually replace it with your computer's IP address (e.g. <code>192.168.x.x</code>).
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* iOS Install Prompt (Visible only on iOS mobile) */}
            <div className="md:hidden">
                <IOSInstallPrompt />
            </div>
        </div>
    );
};

export default MobileWrapper;
