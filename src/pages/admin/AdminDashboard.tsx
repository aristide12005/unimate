import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, X } from "lucide-react";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeListings: 0,
        totalMessages: 0,
        reportedItems: 0
    });
    const [dailyPulse, setDailyPulse] = useState({
        expected: 0,
        submitted: 0,
        missingUsers: [] as string[]
    });
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
                const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const { data: teamMembers } = await supabase.from('profiles').select('id, first_name, last_name').neq('role', 'admin');
                const { data: todayReports } = await supabase.from('reports').select('employee_id, profiles(first_name, last_name)').eq('date', todayStr);

                setStats({
                    totalUsers: usersCount || 0,
                    activeListings: listingsCount || 0,
                    totalMessages: messagesCount || 0,
                    reportedItems: 0 // Placeholder
                });

                if (teamMembers && todayReports) {
                    const submittedIds = new Set(todayReports.map(r => r.employee_id));
                    const missing = teamMembers
                        .filter(m => !submittedIds.has(m.id))
                        .map(m => `${m.first_name || 'Unknown'} ${m.last_name || ''}`.trim());

                    setDailyPulse({
                        expected: teamMembers.length,
                        submitted: submittedIds.size,
                        missingUsers: missing
                    });
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description: string }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {showBanner && (
                <Alert className="bg-primary/10 border-primary/20 text-primary relative">
                    <Megaphone className="h-4 w-4" />
                    <AlertTitle>Company Announcement</AlertTitle>
                    <AlertDescription>
                        Welcome to the new Management Dashboard. Please review your team's DAR (Daily Activity Reports) at the end of every day.
                    </AlertDescription>
                    <button onClick={() => setShowBanner(false)} className="absolute top-4 right-4 text-primary/70 hover:text-primary">
                        <X size={16} />
                    </button>
                </Alert>
            )}

            <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    description="Registered users on platform"
                />
                <StatCard
                    title="Active Listings"
                    value={stats.activeListings}
                    icon={Home}
                    description="Current properties listed"
                />
                <StatCard
                    title="Total Messages"
                    value={stats.totalMessages}
                    icon={TrendingUp}
                    description="Messages exchanged"
                />
                <StatCard
                    title="Reports"
                    value={stats.reportedItems}
                    icon={AlertCircle}
                    description="Items requiring attention"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Chart Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Mock activity */}
                            {[1, 2, 3].map((i) => (
                                <div className="flex items-center" key={i}>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">New user registered</p>
                                        <p className="text-xs text-muted-foreground">Just now</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Pulse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">DARs Submitted Today</span>
                                <span className="font-bold">{dailyPulse.submitted} / {dailyPulse.expected}</span>
                            </div>

                            {dailyPulse.missingUsers.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold uppercase text-red-500 mb-2">Pending Reports</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dailyPulse.missingUsers.map((user, idx) => (
                                            <span key={idx} className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-md text-xs">
                                                {user}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {dailyPulse.missingUsers.length === 0 && dailyPulse.expected > 0 && (
                                <div className="text-sm text-green-600 font-medium pt-4">All team members have submitted their reports today! 🎉</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
