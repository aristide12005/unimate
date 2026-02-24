import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import {
    Home,
    Users,
    Radio,
    MessageCircle,
    Bell,
    User,
    Settings,
    PlusCircle,
    ArrowRight,
    MapPin,
    Mail,
    Phone
} from "lucide-react";

export const DesktopFooter = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = useAuth();

    // If we're on a route that takes up the full screen (like the map side-by-side or chat screen), 
    // maybe we don't want the footer. But typically we want it on Home, Profile, Settings, etc.
    // The instructions said "on desktop view". We'll just render it and let DesktopLayout handle it.

    // We can avoid showing the footer on the /listings route if it has a sticky map taking the whole height, 
    // but looking at ListingsScreen.tsx it seems to have a scrollable left side. 
    // Let's just always render it where DesktopLayout puts it.

    const quickLinks = [
        { label: "Home", path: "/home", icon: Home },
        { label: "Rooms", path: "/listings", icon: Users },
        { label: "Connect", path: "/connect", icon: Radio },
        { label: "Messages", path: "/messages", icon: MessageCircle },
        { label: "Activity", path: "/activity", icon: Bell },
        { label: "My Profile", path: "/profile", icon: User },
    ];

    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-12 w-full shrink-0">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Column 1: Brand & About */}
                    <div className="md:col-span-1">
                        <button
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-2 mb-4 shrink-0 transition-opacity hover:opacity-80"
                        >
                            <img src={logo} alt="uniMate" className="w-9 h-9 rounded-lg object-contain bg-primary/10 p-1" />
                            <span className="text-xl font-black tracking-tight text-gray-900">
                                uni<span className="text-primary">Mate</span>
                            </span>
                        </button>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium pr-4">
                            Your trusted platform to find the perfect student room and connect with other students in Dakar.
                        </p>
                        <div className="flex flex-col gap-3 text-sm text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-primary shrink-0" />
                                <span>Dakar, Senegal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-primary shrink-0" />
                                <span>+221 76 243 6893</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-primary shrink-0" />
                                <span>hello@unimate.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-5 text-base tracking-tight">Navigation</h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        className="text-gray-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2 group"
                                    >
                                        <link.icon size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Account & Hosting */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-5 text-base tracking-tight">Account</h3>
                        <ul className="space-y-3">
                            {!user ? (
                                <>
                                    <li>
                                        <button onClick={() => navigate("/login")} className="text-gray-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">
                                            Log in
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => navigate("/login")} className="text-gray-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2">
                                            Sign up
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <button onClick={() => navigate("/settings")} className="text-gray-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2 group">
                                            <Settings size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            Settings
                                        </button>
                                    </li>
                                    <li className="pt-2">
                                        <button
                                            onClick={() => {
                                                if (profile?.host_mode_active) {
                                                    navigate("/post-room");
                                                } else {
                                                    navigate("/profile?activateHost=true");
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors text-sm font-bold mt-1"
                                        >
                                            <PlusCircle size={16} />
                                            {profile?.host_mode_active ? "Post a Room" : "Become a Host"}
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Column 4: CTA */}
                    <div>
                        <h3 className="font-black text-gray-900 mb-4 text-xl tracking-tight leading-tight">Join uniMate today!</h3>
                        <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">
                            Create an account to message hosts, post your own room, and save your favorites.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate("/login?mode=signup")}
                                className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-95"
                            >
                                Sign up
                            </button>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold py-2.5 rounded-lg transition-all active:scale-95"
                            >
                                Log in
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-medium">
                    <p>© {new Date().getFullYear()} uniMate. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <button className="hover:text-primary transition-colors">Privacy Policy</button>
                        <button className="hover:text-primary transition-colors">Terms of Service</button>
                        <button className="hover:text-primary transition-colors">Help Center</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
