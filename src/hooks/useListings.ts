import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_LISTINGS } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchFilters {
    query: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    type: string;
    features: string[];
    school: string;
}

const INITIAL_FILTERS: SearchFilters = {
    query: "",
    location: "",
    minPrice: 0,
    maxPrice: 10000000, // Increased to 10M to ensure all listings are visible by default
    type: "",
    features: [],
    school: ""
};

export const useListings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savedListingIds, setSavedListingIds] = useState<Set<number>>(new Set());

    // Internal Filter State
    const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);

    // Initial Load & Saved Listings
    useEffect(() => {
        const fetchSaved = async () => {
            if (!user) return;
            const { data } = await supabase
                .from('saved_listings')
                .select('listing_id')
                .eq('user_id', user.id);

            if (data) {
                setSavedListingIds(new Set(data.map(d => d.listing_id)));
            }
        };
        fetchSaved();
    }, [user]);

    // Debounced Search Effect
    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('listings')
                    .select(`
                        *,
                        author:author_id (
                            id,
                            first_name,
                            last_name,
                            username,
                            avatar_url,
                            background_image,
                            age,
                            gender,
                            bio,
                            occupation,
                            school_company
                        )
                    `);

                // 1. Text Search (Location, Title, School)
                if (filters.query) {
                    query = query.or(`title.ilike.%${filters.query}%,location.ilike.%${filters.query}%,description.ilike.%${filters.query}%,type.ilike.%${filters.query}%`);
                }

                // 2. Location (Specific)
                if (filters.location) {
                    query = query.ilike('location', `%${filters.location}%`);
                }

                // 3. Price Range
                if (filters.minPrice !== undefined) {
                    query = query.gte('price_amount', filters.minPrice);
                }
                if (filters.maxPrice !== undefined) {
                    query = query.lte('price_amount', filters.maxPrice);
                }

                // 4. Type
                if (filters.type && filters.type !== 'All') {
                    query = query.eq('type', filters.type);
                }

                // 5. Conditions/Features (Array Contains)
                if (filters.features && filters.features.length > 0) {
                    query = query.contains('features', filters.features);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                console.log("Supabase Listings Fetch:", { data, error }); // DEBUG LOG

                if (error) throw error;

                if (data && data.length > 0) {
                    const formattedData = data.map(item => {
                        // Handle missing author gracefully
                        const author = item.author || {
                            id: 'unknown',
                            first_name: 'Unknown',
                            last_name: 'User',
                            username: 'unknown',
                            avatar_url: null
                        };

                        return {
                            ...item,
                            author: {
                                id: author.id,
                                name: `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.username || 'Anonymous',
                                avatar: author.avatar_url,
                                backgroundImage: author.background_image,
                                age: author.age,
                                gender: author.gender,
                                bio: author.bio,
                                occupation: author.occupation,
                                school: author.school_company
                            },
                            postedAt: new Date(item.created_at).toLocaleDateString()
                        };
                    });

                    // Client-side filter for School
                    if (filters.school) {
                        const schoolQuery = filters.school.toLowerCase();
                        const finalData = formattedData.filter((item: any) =>
                            item.author.school && item.author.school.toLowerCase().includes(schoolQuery)
                        );
                        setListings(finalData);
                    } else {
                        setListings(formattedData);
                    }
                } else {
                    console.warn("No listings found in DB. Showing empty state (NOT mocks).");
                    setListings([]); // FORCE EMPTY STATE TO VERIFY DB CONNECTION
                }

            } catch (err: any) {
                console.error("Error searching listings:", err);
                setError(err.message);
                setListings([]); // Do not fall back to mocks on error, show the error state
            } finally {
                setLoading(false);
            }
        };

        // Debounce
        const timer = setTimeout(() => {
            fetchListings();
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

    const toggleSave = async (listingId: number) => {
        if (!user) return;
        const isSaved = savedListingIds.has(listingId);

        // Optimistic update
        const newSaved = new Set(savedListingIds);
        if (isSaved) newSaved.delete(listingId);
        else newSaved.add(listingId);
        setSavedListingIds(newSaved);

        try {
            if (isSaved) {
                await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listingId);
            } else {
                await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: listingId });
            }
        } catch (err) {
            console.error("Error toggling save:", err);
            // Revert on error
            setSavedListingIds(savedListingIds);
        }
    };

    return { listings, loading, error, savedListingIds, toggleSave, filters, setFilters };
};
