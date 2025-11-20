#!/usr/bin/env node

// DNS Propagation Monitor for api.buyprintz.com
const https = require('https');

let attempts = 0;
const maxAttempts = 20; // Check for ~10 minutes

async function checkAPIDomain() {
    return new Promise((resolve) => {
        attempts++;
        console.log(`\n🔍 Attempt ${attempts}/${maxAttempts} - Testing api.buyprintz.com`);
        console.log(`⏰ ${new Date().toLocaleTimeString()}`);
        
        const req = https.get('https://api.buyprintz.com/health', (res) => {
            const server = res.headers.server;
            console.log(`📡 Status: ${res.statusCode}`);
            console.log(`🖥️  Server: ${server}`);
            
            if (server === 'railway-edge') {
                console.log('🎉 SUCCESS! DNS propagation complete!');
                console.log('✅ api.buyprintz.com now points to Railway');
                console.log('');
                console.log('🎯 Next Steps:');
                console.log('  1. Update Vercel environment variables');
                console.log('  2. Redeploy frontend');
                console.log('  3. Test full application');
                resolve('success');
            } else if (server === 'Vercel') {
                console.log('⏳ Still pointing to Vercel - DNS propagating...');
                resolve('vercel');
            } else {
                console.log(`🤔 Unknown server: ${server}`);
                resolve('unknown');
            }
        });
        
        req.on('error', (error) => {
            console.log(`❌ Error: ${error.message}`);
            console.log('🔄 This is normal during DNS propagation');
            resolve('error');
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Timeout - DNS still propagating');
            req.destroy();
            resolve('timeout');
        });
    });
}

async function monitorPropagation() {
    console.log('🚀 DNS Propagation Monitor Started');
    console.log('==================================');
    console.log('Expected: api.buyprintz.com → Railway (railway-edge server)');
    console.log('Current: Checking every 30 seconds...');
    
    while (attempts < maxAttempts) {
        const result = await checkAPIDomain();
        
        if (result === 'success') {
            break;
        }
        
        if (attempts < maxAttempts) {
            console.log('⏳ Waiting 30 seconds for next check...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log('\n⏰ Monitoring complete after 10 minutes');
        console.log('If still not working:');
        console.log('  • DNS can take up to 24 hours');
        console.log('  • Check GoDaddy record was saved correctly');
        console.log('  • Try: nslookup api.buyprintz.com');
    }
}

// Start monitoring
monitorPropagation().catch(console.error);
