export interface University {
    name: string;
    country: string;
    alpha_two_code: string;
    "state-province": string | null;
    domains: string[];
    web_pages: string[];
}

const BASE_URL = "http://universities.hipolabs.com/search";

export const searchUniversities = async (name: string, country: string = "Senegal"): Promise<University[]> => {
    try {
        const params = new URLSearchParams();
        if (name) params.append("name", name);
        if (country) params.append("country", country);

        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch universities");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching universities:", error);
        return [];
    }
};
