import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DiagnosticPage = () => {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Admin Diagnostics</h1>

            <div className="p-4 border rounded bg-gray-50 space-y-2">
                <div><strong>Loading:</strong> {loading ? "Yes" : "No"}</div>
                <div><strong>User ID:</strong> {user?.id || "Not logged in"}</div>
                <div><strong>Email:</strong> {user?.email || "N/A"}</div>
                <div className="text-blue-600 font-bold">
                    <strong>Role (from DB):</strong> {profile?.role ? profile.role : "UNDEFINED"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                    Raw Profile: {JSON.stringify(profile, null, 2)}
                </div>
            </div>

            <div className="space-y-4">
                {profile?.role !== 'admin' && (
                    <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded">
                        ⚠️ <strong>You are NOT an Admin.</strong>
                        <p className="mt-2 text-sm">
                            Please run the SQL script `DEPLOY_ADMIN.sql` in your Supabase Dashboard to update your role.
                        </p>
                    </div>
                )}

                {profile?.role === 'admin' && (
                    <div className="p-4 border border-green-200 bg-green-50 text-green-800 rounded">
                        ✅ <strong>You ARE an Admin!</strong>
                        <p className="mt-2 text-sm">
                            You should be able to access the dashboard.
                        </p>
                        <Button onClick={() => navigate("/admin")} className="mt-4">
                            Go to Admin Dashboard
                        </Button>
                    </div>
                )}

                <Button variant="outline" onClick={() => navigate("/home")}>
                    Back to Home
                </Button>
            </div>
        </div>
    );
};

export default DiagnosticPage;
