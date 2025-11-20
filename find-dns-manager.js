#!/usr/bin/env node

// DNS Manager Detection for buyprintz.com
const https = require('https');

console.log('🔍 DNS Manager Detection for buyprintz.com');
console.log('==========================================');

// Test different endpoints to see who's managing what
const tests = [
    {
        name: 'Main Domain',
        url: 'https://buyprintz.com',
        expected: 'Should point to Vercel (frontend)'
    },
    {
        name: 'WWW Subdomain', 
        url: 'https://www.buyprintz.com',
        expected: 'Should point to Vercel (frontend)'
    },
    {
        name: 'API Subdomain',
        url: 'https://api.buyprintz.com',
        expected: 'Currently points to Vercel (should point to Railway)'
    }
];

async function testEndpoint(test) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);
        console.log(`Expected: ${test.expected}`);
        
        const req = https.get(test.url, (res) => {
            const server = res.headers.server;
            const location = res.headers.location;
            
            console.log(`Status: ${res.statusCode}`);
            console.log(`Server: ${server}`);
            if (location) console.log(`Redirect: ${location}`);
            
            // Determine DNS manager based on response
            if (server === 'Vercel') {
                console.log('🎯 DNS Manager: Likely VERCEL');
            } else if (server === 'railway-edge') {
                console.log('🎯 DNS Manager: Points to RAILWAY (correct for API)');
            } else if (server && server.includes('cloudflare')) {
                console.log('🎯 DNS Manager: Likely CLOUDFLARE');
            } else {
                console.log(`🎯 DNS Manager: UNKNOWN (${server})`);
            }
            
            resolve();
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve();
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Timeout');
            req.destroy();
            resolve();
        });
    });
}

async function detectDNSManager() {
    for (const test of tests) {
        await testEndpoint(test);
    }
    
    console.log('\n📋 Analysis:');
    console.log('============');
    console.log('If ALL endpoints show "Vercel" server:');
    console.log('  → DNS is managed by VERCEL');
    console.log('  → Add api CNAME in Vercel dashboard');
    console.log('');
    console.log('If mixed servers or errors:');
    console.log('  → DNS might be managed by GoDaddy or other provider');
    console.log('  → Check GoDaddy DNS management access');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Check Vercel dashboard for DNS management');
    console.log('  2. Or reset GoDaddy nameservers to default');
    console.log('  3. Add api CNAME in the correct DNS manager');
}

detectDNSManager().catch(console.error);
