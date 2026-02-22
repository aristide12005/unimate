import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { initNative } from "./services/native";

// Bootstrap native plugins (status bar, splash screen hide).
// Safe no-op on web.
initNative();

createRoot(document.getElementById("root")!).render(
    <GlobalErrorBoundary>
        <App />
    </GlobalErrorBoundary>
);
