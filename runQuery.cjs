const fs = require('fs');

async function runQuery() {
    const payload = JSON.parse(fs.readFileSync('query.json', 'utf8'));

    try {
        const response = await fetch('https://api.supabase.com/v1/projects/hcttznfhzzxibftkkrcy/database/query', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sbp_316ce359cb185711fadd0998aa517c1405858365`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Error:', response.status, err);
            process.exit(1);
        }

        const data = await response.json();
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch exception:', e);
        process.exit(1);
    }
}

runQuery();
