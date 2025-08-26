#!/usr/bin/env node

// Quick verification script for API domain fix
const https = require('https');

async function verifyFix() {
    console.log('🔧 Verifying API Domain Fix');
    console.log('==========================');
    
    const testUrl = 'https://api.buyprintz.com/health';
    
    return new Promise((resolve) => {
        console.log(`🧪 Testing: ${testUrl}`);
        
        const req = https.get(testUrl, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Server: ${res.headers.server}`);
            
            if (res.headers.server === 'railway-edge') {
                console.log('✅ SUCCESS! API domain now points to Railway');
                console.log('🎯 Next: Update Vercel environment variables');
            } else if (res.headers.server === 'Vercel') {
                console.log('⚠️  Still pointing to Vercel');
                console.log('📋 Actions needed:');
                console.log('  1. Add custom domain in Railway dashboard');
                console.log('  2. Update DNS CNAME record to point to Railway');
                console.log('  3. Wait for DNS propagation (0-24 hours)');
            } else {
                console.log(`🤔 Unknown server: ${res.headers.server}`);
            }
            
            resolve();
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            console.log('🔧 This might mean DNS is still propagating');
            resolve();
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Timeout - DNS might still be propagating');
            req.destroy();
            resolve();
        });
    });
}

verifyFix();
