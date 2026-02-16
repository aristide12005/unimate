import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_LISTINGS } from '@/data/mockData';

export const useListings = () => {
    const [listings, setListings] = useState<any[]>(MOCK_LISTINGS); // Fallback to mock initially
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
              occupation
            )
          `)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching listings:', error);
                    setError(error.message);
                } else if (data && data.length > 0) {
                    // Normalize data structure if needed
                    const formattedData = data.map(item => ({
                        ...item,
                        // Ensure author object is shaped correctly
                        author: {
                            id: item.author.id, // Keep UUID for internal use but ensure type compatibility
                            name: `${item.author.first_name || ''} ${item.author.last_name || ''}`.trim() || item.author.username,
                            avatar: item.author.avatar_url,
                            backgroundImage: item.author.background_image,
                            age: item.author.age,
                            gender: item.author.gender,
                            bio: item.author.bio,
                            occupation: item.author.occupation
                        },
                        postedAt: new Date(item.created_at).toLocaleDateString() // Simple format
                    }));
                    setListings(formattedData);
                }
            } catch (err: any) {
                console.error("Unexpected error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    return { listings, loading, error };
};
