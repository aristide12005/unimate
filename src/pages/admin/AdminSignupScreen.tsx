import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import UMLogo from "@/components/UMLogo";
import { Loader2, LockKeyhole, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const AdminSignupScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [position, setPosition] = useState("");
    const [phone, setPhone] = useState("");
    const [isWhatsapp, setIsWhatsapp] = useState(true);
    const [secretCode, setSecretCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    // Hardcoded secret for now - in production this should be an env var or backend check
    const ADMIN_SECRET = "UNIMATE_ADMIN_SECRET";

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (secretCode !== ADMIN_SECRET) {
            toast.error("Invalid Admin Secret Code");
            setLoading(false);
            return;
        }

        try {
            // 1. Sign Up Logic
            const { error } = await signUp(email, password);
            if (error) throw error;

            // 2. Wait for auth state change or get user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Generate a username for DB requirement
                const generatedUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_admin_${Math.floor(Math.random() * 1000)}`;

                // 3. Create Admin Profile
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        user_id: user.id,
                        username: generatedUsername,
                        role: 'admin',
                        first_name: firstName,
                        last_name: lastName,
                        position: position,
                        phone: phone,
                        is_whatsapp: isWhatsapp,
                        updated_at: new Date().toISOString()
                    });

                if (profileError) {
                    await supabase.from("profiles").upsert({
                        user_id: user.id,
                        username: generatedUsername,
                        role: 'admin',
                        first_name: firstName,
                        last_name: lastName,
                        position: position,
                        phone: phone,
                        is_whatsapp: isWhatsapp,
                    }, { onConflict: 'user_id' });
                }

                toast.success("Admin Account Created! Please check your email/login.");
                navigate("/admin/login");
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
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
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white p-1 rounded-full">
                            <LockKeyhole size={16} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mt-4 text-gray-900">Create Admin Account</h1>
                    <p className="text-sm text-gray-500">Requires a Secret Code</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Admin"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="User"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position">Admin Position</Label>
                        <Input
                            id="position"
                            placeholder="e.g. Head of Operations"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-xl bg-green-50/50 border-green-100">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <MessageCircle size={16} className="text-green-600" />
                                Available on WhatsApp?
                            </span>
                            <span className="text-xs text-green-600 font-semibold">Recommended</span>
                        </div>
                        <Switch
                            checked={isWhatsapp}
                            onCheckedChange={setIsWhatsapp}
                            className="data-[state=checked]:bg-green-600"
                        />
                    </div>

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
                    <div className="space-y-2">
                        <Label htmlFor="secret" className="text-red-600 font-bold">Secret Code</Label>
                        <Input
                            id="secret"
                            type="password"
                            placeholder="Enter secret code"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            required
                            className="h-11 border-red-200 focus:border-red-500 focus:ring-red-200"
                        />
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Create Admin Account
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-gray-900">
                        ← Back to Admin Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSignupScreen;
