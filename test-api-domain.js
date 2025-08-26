#!/usr/bin/env node

// API Domain Testing Script for BuyPrintz.com
const https = require('https');

const API_BASE = 'https://api.buyprintz.com';
const FALLBACK_API = 'https://buy-printz-production.up.railway.app';

console.log('🧪 Testing BuyPrintz API Domain Configuration');
console.log('============================================');

// Test endpoints
const endpoints = [
    '/',
    '/health', 
    '/docs',
    '/api/auth/test'
];

async function testEndpoint(baseUrl, endpoint) {
    return new Promise((resolve) => {
        const url = `${baseUrl}${endpoint}`;
        console.log(`\n🔍 Testing: ${url}`);
        
        const req = https.get(url, (res) => {
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
            
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ SUCCESS`);
                } else {
                    console.log(`   ⚠️  Warning: Status ${res.statusCode}`);
                }
                resolve({ status: res.statusCode, data });
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ ERROR: ${error.message}`);
            resolve({ error: error.message });
        });
        
        req.setTimeout(10000, () => {
            console.log(`   ⏰ TIMEOUT after 10 seconds`);
            req.destroy();
            resolve({ error: 'Timeout' });
        });
    });
}

async function testAPIDomain() {
    console.log('\n1️⃣ Testing New API Domain (api.buyprintz.com)');
    console.log('-'.repeat(50));
    
    for (const endpoint of endpoints) {
        await testEndpoint(API_BASE, endpoint);
    }
    
    console.log('\n2️⃣ Testing Fallback Domain (Railway)');
    console.log('-'.repeat(50));
    
    for (const endpoint of endpoints) {
        await testEndpoint(FALLBACK_API, endpoint);
    }
    
    console.log('\n📋 Summary');
    console.log('='.repeat(50));
    console.log('If api.buyprintz.com shows errors:');
    console.log('  • Check DNS propagation (can take 24-48 hours)');
    console.log('  • Verify CNAME record in domain registrar');
    console.log('  • Confirm Railway custom domain is active');
    console.log('');
    console.log('If Railway domain works but custom domain fails:');
    console.log('  • DNS propagation is still in progress');
    console.log('  • Check with: https://dnschecker.org');
    console.log('');
    console.log('Next steps:');
    console.log('  • Update Vercel environment variables');
    console.log('  • Redeploy frontend');
    console.log('  • Test full application flow');
}

// Run the tests
testAPIDomain().catch(console.error);
