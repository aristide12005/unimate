export interface HousingRules {
    custom_terms?: string;
    shared_spaces?: string[];
    private_spaces?: string[];
    utility_modes?: {
        electricity?: 'included' | 'split_percentage' | 'metered' | 'fixed_monthly';
        water?: 'included' | 'split_percentage' | 'metered' | 'fixed_monthly';
        wifi?: 'included' | 'split_percentage' | 'fixed_monthly';
    };
    host_preferences?: {
        languages?: string[];
        environment?: 'quiet_study' | 'social_hub' | 'family_home' | 'party_friendly';
        cooking?: 'shared_meals' | 'separate_meals' | 'kitchen_access_only';
        pets_allowed?: boolean;
        smoking_allowed?: boolean;
    };
}

export interface ListingFormData {
    title: string;
    type: string;
    price: number;
    location: string;
    latitude?: number;
    longitude?: number;
    description: string;
    features: string[];
    image_url: string;
    images: { url: string; category: string }[];
    housing_rules: HousingRules;
    contact_phone: string;
    available_from: string;
}

export const INITIAL_HOUSING_RULES: HousingRules = {
    custom_terms: "",
    shared_spaces: [],
    private_spaces: [],
    utility_modes: {},
    host_preferences: {}
};
