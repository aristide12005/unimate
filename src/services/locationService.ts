export interface Location {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
}

const BASE_URL = "https://nominatim.openstreetmap.org/search";

export const searchLocations = async (query: string): Promise<Location[]> => {
    try {
        const params = new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "5",
            countrycodes: "sn", // Limit to Senegal for relevance
        });

        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch locations");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
};
