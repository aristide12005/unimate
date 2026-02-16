import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const InstallPWA = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        // Listen for the install prompt
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClick = (evt: any) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null; // Don't show if not installable (e.g. already installed or not supported)
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-xs hover:bg-primary/20 transition-colors"
        >
            <Download size={16} />
            Install App
        </button>
    );
};

export default InstallPWA;
