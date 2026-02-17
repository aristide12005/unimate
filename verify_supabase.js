import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hcttznfhzzxibftkkrcy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdHR6bmZoenp4aWJmdGtrcmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjcxMzAsImV4cCI6MjA4Njc0MzEzMH0.EXsqEfMF5JWLoIULqWsbifACgrgKKrDjE7tjc4IWi0E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Testing Supabase connection...");
    try {
        // Just try to fetch the count of profiles, lightweight check
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("❌ Connection failed:", error.message);
            if (error.code) console.error("Error code:", error.code);
        } else {
            console.log("✅ Connection successful!");
            console.log(`Found ${count !== null ? count : 'unknown'} profiles.`);
        }
    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
}

testConnection();
