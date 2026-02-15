const SimpleTest = () => {
    return (
        <div style={{
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f0f0f0',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#2c5282' }}>✅ React is Working!</h1>
            <p style={{ fontSize: '18px', marginTop: '20px' }}>
                If you can see this text, React is rendering correctly.
            </p>
            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2>Environment Check:</h2>
                <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ NOT SET'}</p>
                <p><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ SET' : '❌ NOT SET'}</p>
                <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
            </div>
        </div>
    );
};

export default SimpleTest;
