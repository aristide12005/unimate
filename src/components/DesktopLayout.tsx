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
    { label: "Messages", path: "/messages", icon: MessageCircle, badge: true, protectedAuth: true },
    { label: "Connect", path: "/connect", icon: Radio, protectedAuth: true },
];

// Tucked inside the "My Account" dropdown
const accountLinks = [
    { label: "Activity", path: "/activity", icon: Bell, protectedAuth: true },
    { label: "My Profile", path: "/profile", icon: User, protectedAuth: true },
    { label: "Settings", path: "/settings", icon: Settings, matchPrefix: true, protectedAuth: true },
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

    const handleProtectedNavigation = (path: string, isProtected?: boolean) => {
        if (isProtected && !user) {
            navigate('/login', { state: { returnTo: path } });
        } else {
            navigate(path);
        }
    };

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
                        {mainLinks.map(({ label, path, icon: Icon, matchPrefix, badge, protectedAuth }) => {
                            const active = isActive(path, matchPrefix);
                            return (
                                <button
                                    key={path}
                                    onClick={() => handleProtectedNavigation(path, protectedAuth)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                >
                                    <div className="relative">
                                        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                                        {badge && unreadCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </div>
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
                                {/* Language Selector */}
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors font-bold text-sm">
                                    Eng
                                    <ChevronDown size={14} strokeWidth={3} />
                                </button>

                                {/* Notification Bell */}
                                <button
                                    onClick={() => navigate('/activity')}
                                    className="relative w-10 h-10 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <Bell size={20} strokeWidth={2} />
                                    {totalBadge > 0 && (
                                        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                                    )}
                                </button>

                                {/* My Account dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setAccountOpen((v) => !v)}
                                        className="flex items-center gap-1.5 ml-1"
                                    >
                                        <div className="w-10 h-10 rounded-full border border-transparent hover:border-gray-200 transition-colors overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-primary">
                                                    {user?.email?.[0]?.toUpperCase() ?? "U"}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            strokeWidth={3}
                                            className={`text-gray-900 transition-transform ${accountOpen ? "rotate-180" : ""}`}
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
                                            {accountLinks.map(({ label, path, icon: Icon, matchPrefix, protectedAuth }) => {
                                                const active = isActive(path, matchPrefix);
                                                return (
                                                    <button
                                                        key={path}
                                                        onClick={() => { setAccountOpen(false); handleProtectedNavigation(path, protectedAuth); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active
                                                            ? "bg-primary/8 text-primary font-medium"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <Icon size={15} className={active ? "text-primary" : "text-gray-400"} />
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
