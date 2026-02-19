
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface Lifestyle {
    smoke?: string;
    pets?: string;
    schedule?: string;
    guests?: string;
    cleanliness?: string;
}

interface CompatibilityResult {
    score: number;
    matches: string[];
    mismatches: string[];
    loading: boolean;
}

export const useCompatibility = (targetListing?: any, targetProfile?: any) => {
    const { user } = useAuth();
    const [compatibility, setCompatibility] = useState<CompatibilityResult>({
        score: 0,
        matches: [],
        mismatches: [],
        loading: true
    });

    useEffect(() => {
        const calculateCompatibility = async () => {
            if (!user) return;

            // Fetch current user's lifestyle if not available
            const { data: userData, error } = await supabase
                .from("profiles")
                .select("lifestyle, languages")
                .eq("user_id", user.id)
                .single();

            if (error || !userData) {
                console.error("Error fetching user lifestyle for compatibility:", error);
                setCompatibility(prev => ({ ...prev, loading: false }));
                return;
            }

            const myLifestyle = ((userData as any).lifestyle || {}) as Lifestyle;

            let score = 0;
            let maxScore = 0;
            const matches: string[] = [];
            const mismatches: string[] = [];

            // 1. Compare with Listing Rules (if targetListing provided)
            if (targetListing && targetListing.housing_rules) {
                const rules = targetListing.housing_rules;

                // Smoking
                maxScore += 20;
                if (rules.allow_smoking) {
                    score += 20; // Correct: Allowed, so compatible unless I hate smokers? 
                    // Assume compatibility is about "Can I live here?"
                    // If I smoke and it's allowed -> Match.
                    // If I don't smoke -> Match (usually).
                    matches.push("Smoking Policy");
                } else {
                    if (myLifestyle.smoke === "Smoker") {
                        mismatches.push("No Smoking Allowed");
                    } else {
                        score += 20;
                        matches.push("Non-Smoking Environment");
                    }
                }

                // Pets
                maxScore += 20;
                if (rules.allow_pets) {
                    score += 20;
                    matches.push("Pets Allowed");
                } else {
                    if (myLifestyle.pets === "Has pets") {
                        mismatches.push("No Pets Allowed");
                    } else {
                        score += 20;
                        matches.push("Pet-Free Environment");
                    }
                }
            }

            // 2. Compare with Target Profile (Host/Roommate)
            const otherProfile = targetProfile || (targetListing?.author);
            if (otherProfile && otherProfile.lifestyle) {
                const other = otherProfile.lifestyle as Lifestyle;

                // Schedule
                maxScore += 20;
                if (myLifestyle.schedule && other.schedule) {
                    if (myLifestyle.schedule === other.schedule) {
                        score += 20;
                        matches.push(`Both are ${myLifestyle.schedule}s`);
                    } else if (myLifestyle.schedule === "Flexible" || other.schedule === "Flexible") {
                        score += 15;
                        matches.push("Flexible Schedules");
                    } else {
                        // Early Bird vs Night Owl
                        score += 5; // Low compatibility
                        mismatches.push("Different Sleep Schedules");
                    }
                } else {
                    score += 10; // Neutral if unknown
                }

                // Cleanliness
                maxScore += 20;
                if (myLifestyle.cleanliness && other.cleanliness) {
                    if (myLifestyle.cleanliness === other.cleanliness) {
                        score += 20;
                        matches.push("Matched Cleanliness");
                    } else if (
                        (myLifestyle.cleanliness === "Average" && other.cleanliness !== "Messy") ||
                        (other.cleanliness === "Average" && myLifestyle.cleanliness !== "Messy")
                    ) {
                        score += 15;
                        matches.push("Compatible Cleanliness");
                    } else {
                        score += 5;
                        mismatches.push("Mismatched Cleanliness");
                    }
                } else {
                    score += 10;
                }

                // Guests
                maxScore += 20;
                if (myLifestyle.guests && other.guests) {
                    if (myLifestyle.guests === other.guests) {
                        score += 20;
                        matches.push("Similar Guest Habits");
                    } else if (myLifestyle.guests === "Never" && other.guests === "Frequent") {
                        mismatches.push("Guest Frequency Mismatch");
                    } else {
                        score += 15;
                        matches.push("Acceptable Guest Habits");
                    }
                } else {
                    score += 10;
                }
            }

            // Normalize Score
            const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

            setCompatibility({
                score: finalScore,
                matches,
                mismatches,
                loading: false
            });
        };

        calculateCompatibility();
    }, [user, targetListing, targetProfile]);

    return compatibility;
};
