

async function debugContent() {
    try {
        const response = await fetch('http://localhost:5000/api/content/privacy_policy');
        const text = await response.text();
        console.log('API Status:', response.status);
        console.log('API Content Preview:', text.substring(0, 200));

        try {
            const json = JSON.parse(text);
            console.log('Content field length:', json.content ? json.content.length : 'undefined');
        } catch (e) {
            console.log('Response is not JSON');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

debugContent();
