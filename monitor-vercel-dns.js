#!/usr/bin/env node

// Monitor DNS changes in Vercel for api.buyprintz.com
const https = require('https');

let attempts = 0;
const maxAttempts = 10; // Check for ~5 minutes (Vercel is usually faster)

async function checkAPIDomain() {
    return new Promise((resolve) => {
        attempts++;
        console.log(`\n🔍 Vercel DNS Check ${attempts}/${maxAttempts}`);
        console.log(`⏰ ${new Date().toLocaleTimeString()}`);
        
        const req = https.get('https://api.buyprintz.com/health', (res) => {
            const server = res.headers.server;
            console.log(`📡 Status: ${res.statusCode}`);
            console.log(`🖥️  Server: ${server}`);
            
            if (server === 'railway-edge') {
                console.log('🎉 SUCCESS! Vercel DNS updated!');
                console.log('✅ api.buyprintz.com now points to Railway');
                console.log('');
                console.log('🎯 Next Steps:');
                console.log('  1. Update Vercel environment variables');
                console.log('  2. Redeploy frontend');
                console.log('  3. Test full application');
                resolve('success');
            } else if (server === 'Vercel') {
                console.log('⏳ Still pointing to Vercel');
                console.log('💡 Make sure to save the DNS record in Vercel');
                resolve('vercel');
            } else {
                console.log(`🤔 Unexpected server: ${server}`);
                resolve('unknown');
            }
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            resolve('error');
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Timeout');
            req.destroy();
            resolve('timeout');
        });
    });
}

async function monitorVercelDNS() {
    console.log('🚀 Vercel DNS Change Monitor');
    console.log('============================');
    console.log('Waiting for: api.buyprintz.com → Railway (railway-edge)');
    console.log('Action needed: Add CNAME record in Vercel DNS');
    console.log('');
    
    while (attempts < maxAttempts) {
        const result = await checkAPIDomain();
        
        if (result === 'success') {
            break;
        }
        
        if (attempts < maxAttempts) {
            console.log('⏳ Waiting 30 seconds...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('\n📋 Still pointing to Vercel after 5 minutes');
        console.log('✅ This is normal - DNS record might not be added yet');
        console.log('');
        console.log('🔧 Double-check in Vercel:');
        console.log('  • Domain settings for buyprintz.com');
        console.log('  • DNS records section');
        console.log('  • Add: CNAME api → ssrmn57r.up.railway.app');
    }
}

monitorVercelDNS().catch(console.error);
