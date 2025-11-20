#!/usr/bin/env node

// Quick DNS test - run this anytime to check status
const https = require('https');

console.log('🧪 Quick DNS Test for api.buyprintz.com');
console.log('======================================');

https.get('https://api.buyprintz.com/health', (res) => {
    const server = res.headers.server;
    console.log(`Status: ${res.statusCode}`);
    console.log(`Server: ${server}`);
    console.log('');
    
    if (server === 'railway-edge') {
        console.log('🎉 SUCCESS! DNS is working correctly');
        console.log('✅ Ready to update Vercel environment variables');
    } else if (server === 'Vercel') {
        console.log('⏳ DNS still propagating (pointing to Vercel)');
        console.log('⏰ Try again in a few minutes');
    } else {
        console.log(`🤔 Unexpected server: ${server}`);
    }
}).on('error', (error) => {
    console.log(`❌ Error: ${error.message}`);
    console.log('🔄 DNS propagation in progress');
});
