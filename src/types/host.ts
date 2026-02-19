
export interface HousingRules {
    shared_spaces: string[];
    private_spaces: string[];
    utility_modes: {
        electricity: 'included' | 'split_percentage' | 'metered' | 'fixed_monthly';
        water: 'included' | 'split_percentage' | 'metered' | 'fixed_monthly';
        wifi: 'included' | 'split_percentage' | 'fixed_monthly';
    };
    host_preferences: {
        languages: string[];
        environment: 'quiet_study' | 'social_hub' | 'family_home' | 'party_friendly';
        cooking: 'shared_meals' | 'separate_meals' | 'kitchen_access_only';
        pets_allowed: boolean;
        smoking_allowed: boolean;
    };
}

export interface ListingFormData {
    title: string;
    type: string;
    price: number;
    location: string;
    description: string;
    features: string[];
    image_url: string;
    housing_rules: HousingRules;
}

export const INITIAL_HOUSING_RULES: HousingRules = {
    shared_spaces: ['kitchen', 'living_room'],
    private_spaces: ['bedroom'],
    utility_modes: {
        electricity: 'split_percentage',
        water: 'fixed_monthly',
        wifi: 'included'
    },
    host_preferences: {
        languages: [],
        environment: 'quiet_study',
        cooking: 'kitchen_access_only',
        pets_allowed: false,
        smoking_allowed: false
    }
};
