import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_LISTINGS } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const useListings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState<any[]>([]); // Initialize empty, fallback handled if fetch fails/empty? Or keep mock.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savedListingIds, setSavedListingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { data, error } = await supabase
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
          `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching listings:', error);
                    setError(error.message);
                } else if (data && data.length > 0) {
                    const formattedData = data.map(item => ({
                        ...item,
                        author: {
                            id: item.author.id,
                            name: `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim() || item.author.username,
                            avatar: item.author.avatar_url,
                            backgroundImage: item.author.background_image,
                            age: item.author.age,
                            gender: item.author.gender,
                            bio: item.author.bio,
                            occupation: item.author.occupation,
                            school: item.author.school_company
                        },
                        postedAt: new Date(item.created_at).toLocaleDateString()
                    }));
                    setListings(formattedData);
                } else {
                    setListings(MOCK_LISTINGS); // Keep mock if no real data
                }
            } catch (err: any) {
                console.error("Unexpected error:", err);
                setError(err.message);
                setListings(MOCK_LISTINGS);
            } finally {
                setLoading(false);
            }
        };

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

        fetchListings();
        fetchSaved();
    }, [user]);

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

    const searchListings = async (filters: any) => {
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

            if (error) throw error;

            if (data) {
                const formattedData = data.map(item => ({
                    ...item,
                    author: {
                        id: item.author.id,
                        name: `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim() || item.author.username,
                        avatar: item.author.avatar_url,
                        backgroundImage: item.author.background_image,
                        age: item.author.age,
                        gender: item.author.gender,
                        bio: item.author.bio,
                        occupation: item.author.occupation,
                        school: item.author.school_company
                    },
                    postedAt: new Date(item.created_at).toLocaleDateString()
                }));

                // Client-side filter for School (joined table filtering is hard in one go without flattened view)
                // If filters.school is present
                if (filters.school) {
                    const schoolQuery = filters.school.toLowerCase();
                    const finalData = formattedData.filter((item: any) =>
                        item.author.school && item.author.school.toLowerCase().includes(schoolQuery)
                    );
                    setListings(finalData);
                } else {
                    setListings(formattedData);
                }
            }

        } catch (err: any) {
            console.error("Error searching listings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { listings, loading, error, savedListingIds, toggleSave, searchListings };
};
