import { useEffect, useState } from "react";

const DiagnosticPage = () => {
    const [envVars, setEnvVars] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const vars = {
                VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'MISSING',
                VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
                NODE_ENV: import.meta.env.MODE || 'MISSING',
            };
            setEnvVars(vars);
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Environment Diagnostic</h1>
            <h2>Environment Variables:</h2>
            <pre>{JSON.stringify(envVars, null, 2)}</pre>
            {error && (
                <div style={{ color: 'red', marginTop: '20px' }}>
                    <h2>Error:</h2>
                    <pre>{error}</pre>
                </div>
            )}
            <h2>Test Status:</h2>
            <p style={{ color: 'green' }}>✓ Page is rendering</p>
            <p style={{ color: 'green' }}>✓ React is working</p>
        </div>
    );
};

export default DiagnosticPage;
