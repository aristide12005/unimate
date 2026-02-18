import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Users, LayoutDashboard, Database, LogOut, Menu, X, Briefcase, MessageSquare, FileText } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UMLogo from "@/components/UMLogo";

const AdminLayout = () => {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => (
        <Link
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(path)
                ? "bg-primary text-primary-foreground font-semibold shadow-md"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-black text-xl">
                            <Database className="w-6 h-6" />
                            <span>UniMate<span className="text-gray-400 font-normal text-sm ml-1">Admin</span></span>
                        </div>
                        <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        <NavItem path="/admin" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem path="/admin/users" icon={Users} label="Users" />
                        <NavItem path="/admin/team" icon={Briefcase} label="Team" />
                        <NavItem path="/admin/reports" icon={FileText} label="Reports" />
                        <NavItem path="/admin/messages" icon={MessageSquare} label="Messages" />
                        <NavItem path="/admin/listings" icon={Database} label="Listings" />
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={handleSignOut}
                        >
                            <LogOut size={18} />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between md:justify-end relative">
                    <button
                        className="md:hidden p-2 -ml-2 text-gray-500"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Centered Logo */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <UMLogo size={32} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-900">
                                {profile?.first_name || 'Admin'} {profile?.last_name || 'User'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {profile?.position || 'Administrator'}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {profile?.first_name?.[0] || 'A'}{profile?.last_name?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </div>
            </main>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
