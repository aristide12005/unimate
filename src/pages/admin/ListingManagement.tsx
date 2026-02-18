import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const ListingManagement = () => {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from("listings")
                .select("*, profiles(first_name, last_name, username)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;

        try {
            const { error } = await supabase.from("listings").delete().eq("id", id);
            if (error) throw error;
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting listing:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Posted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                            </TableRow>
                        ) : listings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">No listings found</TableCell>
                            </TableRow>
                        ) : (
                            listings.map((listing) => (
                                <TableRow key={listing.id}>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={listing.title}>
                                        {listing.title}
                                    </TableCell>
                                    <TableCell>
                                        {listing.profiles ? (
                                            <span className="text-sm text-muted-foreground">
                                                {listing.profiles.first_name} {listing.profiles.last_name}
                                            </span>
                                        ) : "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{listing.type || "Listing"}</Badge>
                                    </TableCell>
                                    <TableCell>${listing.price}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(listing.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => window.open(`/listings/${listing.id}`, '_blank')}>
                                                    <ExternalLink className="mr-2 h-4 w-4" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(listing.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ListingManagement;
