import { ReactNode, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
    Home,
    Users,
    Radio,
    MessageCircle,
    Bell,
    User,
    PlusCircle,

    ChevronDown,
    Settings,
    LogOut,
} from "lucide-react";
import { useUnread } from "@/contexts/UnreadContext";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopFooter } from "./DesktopFooter";

interface DesktopLayoutProps {
    children: ReactNode;
}

// Always-visible nav links (main discovery features)
const mainLinks = [
    { label: "Home", path: "/home", icon: Home },
    { label: "Rooms", path: "/listings", icon: Users, matchPrefix: true },
];

// Tucked inside the "My Account" dropdown
const accountLinks = [
    { label: "Messages", path: "/messages", icon: MessageCircle, badge: true },
    { label: "Activity", path: "/activity", icon: Bell },
    { label: "Connect", path: "/connect", icon: Radio },
    { label: "My Profile", path: "/profile", icon: User },
    { label: "Settings", path: "/settings", icon: Settings, matchPrefix: true },
];

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useUnread();
    const { user, profile, signOut } = useAuth();
    const [accountOpen, setAccountOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string, matchPrefix?: boolean) =>
        matchPrefix ? location.pathname.startsWith(path) : location.pathname === path;

    // Is any account-dropdown route currently active?
    const anyAccountActive = accountLinks.some(({ path, matchPrefix }) =>
        isActive(path, matchPrefix)
    );

    // Total badge count across all dropdown items
    const totalBadge = unreadCount;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* ── Top navbar ────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm shrink-0">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">

                    {/* Brand */}
                    <button
                        onClick={() => navigate("/home")}
                        className="flex items-center gap-2 shrink-0 mr-2"
                    >
                        <img src={logo} alt="uniMate" className="w-8 h-8 rounded-lg object-contain" />
                        <span className="text-lg font-bold tracking-tight text-foreground">
                            uni<span className="text-primary">Mate</span>
                        </span>
                    </button>

                    {/* Main links — always visible */}
                    <nav className="flex items-center gap-1">
                        {mainLinks.map(({ label, path, icon: Icon, matchPrefix }) => {
                            const active = isActive(path, matchPrefix);
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                                    {label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right: Auth / Actions */}
                    <div className="flex items-center gap-3">
                        {!user ? (
                            <>
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors rounded-lg hover:bg-gray-100"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={() => navigate("/login?mode=signup")}
                                    className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Post a Room / Become a Host */}
                                <button
                                    onClick={() => {
                                        if (profile?.host_mode_active) {
                                            navigate("/post-room");
                                        } else {
                                            navigate("/profile?activateHost=true");
                                        }
                                    }}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <PlusCircle size={15} />
                                    {profile?.host_mode_active ? "Post a Room" : "Become a Host"}
                                </button>

                                {/* My Account dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setAccountOpen((v) => !v)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${anyAccountActive || accountOpen
                                            ? "border-primary/30 bg-primary/5 text-primary"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Avatar initial */}
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${anyAccountActive || accountOpen ? "bg-primary text-white" : "bg-primary/15 text-primary"
                                            }`}>
                                            {user?.email?.[0]?.toUpperCase() ?? "U"}
                                        </div>
                                        <span className="text-sm font-medium">My Account</span>

                                        {/* Badge on button if there are unread items */}
                                        {totalBadge > 0 && (
                                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                                {totalBadge > 9 ? "9+" : totalBadge}
                                            </span>
                                        )}

                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-400 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    {accountOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                                            {/* Email label */}
                                            <div className="px-3 py-2 border-b border-gray-100 mb-1">
                                                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                                            </div>

                                            {/* Account links */}
                                            {accountLinks.map(({ label, path, icon: Icon, badge, matchPrefix }) => {
                                                const active = isActive(path, matchPrefix);
                                                return (
                                                    <button
                                                        key={path}
                                                        onClick={() => { setAccountOpen(false); navigate(path); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active
                                                            ? "bg-primary/8 text-primary font-medium"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <Icon size={15} className={active ? "text-primary" : "text-gray-400"} />
                                                            {badge && unreadCount > 0 && (
                                                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center border border-white">
                                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {label}
                                                        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                                    </button>
                                                );
                                            })}

                                            {/* Sign out */}
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button
                                                    onClick={() => { setAccountOpen(false); signOut(); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={15} />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </header>

            {/* ── Page content ─────────────────────────────────────────── */}
            <main className={`flex-1 flex flex-col ${location.pathname.startsWith('/listings') ? "w-full" : "max-w-6xl mx-auto px-6 py-6 w-full"}`}>
                <div className="flex-1">
                    {children}
                </div>
                {!location.pathname.startsWith('/listings') && !location.pathname.startsWith('/chat') && (
                    <DesktopFooter />
                )}
            </main>
        </div>
    );
};

export default DesktopLayout;
