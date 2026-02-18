import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeListings: 0,
        totalMessages: 0,
        reportedItems: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
                const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

                setStats({
                    totalUsers: usersCount || 0,
                    activeListings: listingsCount || 0,
                    totalMessages: messagesCount || 0,
                    reportedItems: 0 // Placeholder
                });
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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

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
        </div>
    );
};

export default AdminDashboard;
