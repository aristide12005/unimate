import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import UMLogo from "@/components/UMLogo";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLoginScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) throw error;

            // Check role immediately after login
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("user_id", user.id)
                    .single();

                if (profile?.role === 'admin') {
                    toast.success("Welcome back, Admin");
                    navigate("/admin");
                } else {
                    // Not an admin
                    await supabase.auth.signOut();
                    toast.error("Access Denied. This area is for Administrators only.");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <UMLogo size={48} />
                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mt-4 text-gray-900">Admin Portal</h1>
                    <p className="text-sm text-gray-500">Secure access for uniMate staff</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@unimate.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Sign In to Dashboard
                    </Button>
                </form>

                <div className="mt-6 text-center border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        Need an admin account?{" "}
                        <Link to="/admin/signup" className="text-primary font-semibold hover:underline">
                            Create one here
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-xs text-muted-foreground hover:text-gray-900">
                        ← Back to Student Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginScreen;
