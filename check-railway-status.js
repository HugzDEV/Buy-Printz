#!/usr/bin/env node

// Check Railway domain status vs direct Railway URL
const https = require('https');

async function testEndpoint(name, url) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${name}`);
        console.log(`URL: ${url}`);
        
        const req = https.get(url, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Server: ${res.headers.server}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (data.length < 200) {
                    console.log(`Response: ${data}`);
                } else {
                    console.log(`Response: ${data.substring(0, 100)}...`);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve();
        });
        
        req.setTimeout(10000, () => {
            console.log('⏰ Timeout');
            req.destroy();
            resolve();
        });
    });
}

async function checkRailwayStatus() {
    console.log('🚄 Railway Domain Status Check');
    console.log('==============================');
    
    // Test direct Railway URL (should work)
    await testEndpoint(
        'Direct Railway URL', 
        'https://buy-printz-production.up.railway.app/health'
    );
    
    // Test Railway service URL (should work)
    await testEndpoint(
        'Railway Service URL',
        'https://ssrmn57r.up.railway.app/health'
    );
    
    // Test custom domain (might not work yet)
    await testEndpoint(
        'Custom Domain (api.buyprintz.com)',
        'https://api.buyprintz.com/health'
    );
    
    console.log('\n📋 Analysis:');
    console.log('============');
    console.log('If direct Railway URLs work but custom domain fails:');
    console.log('  → Railway custom domain not fully activated');
    console.log('  → Check Railway dashboard for domain status');
    console.log('  → May need SSL certificate provisioning time');
    console.log('');
    console.log('If custom domain shows Vercel:');
    console.log('  → DNS cache on your machine');
    console.log('  → Try: ipconfig /flushdns');
}

checkRailwayStatus().catch(console.error);
