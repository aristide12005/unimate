import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";

const IOSInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        // Check if already in standalone mode (PWA installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        // Show prompt only on iOS and not in standalone mode
        // We also use a session storage flag to avoid annoying the user every refresh if they closed it
        const hasSeenPrompt = sessionStorage.getItem("iosInstallPromptSeen");

        if (isIOS && !isStandalone && !hasSeenPrompt) {
            // Delay slightly to let the app load
            const timer = setTimeout(() => setShowPrompt(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setShowPrompt(false);
        sessionStorage.setItem("iosInstallPromptSeen", "true");
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col justify-end pb-8 animate-in fade-in duration-300">
            <div className="bg-white m-4 rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-500">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
                >
                    <X size={18} />
                </button>

                <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="App Icon" className="w-12 h-12 object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Install uniMate</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Install this app on your home screen for the best full-screen experience.
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4 text-sm font-medium text-foreground">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-blue-500">
                            <Share size={18} />
                        </div>
                        <span>1. Tap the <span className="font-bold">Share</span> button below</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-foreground">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            <span className="font-bold text-lg">+</span>
                        </div>
                        <span>2. Select <span className="font-bold">Add to Home Screen</span></span>
                    </div>
                </div>

                {/* Arrow pointing down to the browser's share button */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white border-r-[12px] border-r-transparent"></div>
            </div>
        </div>
    );
};

export default IOSInstallPrompt;
