#!/usr/bin/env node

const dns = require('dns').promises;

async function checkDNS() {
    console.log('🔍 DNS Analysis for BuyPrintz.com');
    console.log('=================================');
    
    const domains = [
        'buyprintz.com',
        'www.buyprintz.com', 
        'api.buyprintz.com'
    ];
    
    for (const domain of domains) {
        console.log(`\n📍 Checking: ${domain}`);
        console.log('-'.repeat(40));
        
        try {
            // Check A records
            try {
                const aRecords = await dns.resolve4(domain);
                console.log(`A Records: ${aRecords.join(', ')}`);
            } catch (e) {
                console.log(`A Records: None`);
            }
            
            // Check CNAME records
            try {
                const cnameRecords = await dns.resolveCname(domain);
                console.log(`CNAME: ${cnameRecords.join(', ')}`);
            } catch (e) {
                console.log(`CNAME: None`);
            }
            
            // Try to determine what it points to
            try {
                const addresses = await dns.lookup(domain);
                console.log(`Resolves to: ${addresses.address}`);
                
                // Check if it's Vercel or Railway
                if (addresses.address.includes('76.76.19') || addresses.address.includes('76.223.126')) {
                    console.log(`🎯 Points to: VERCEL`);
                } else {
                    console.log(`🎯 Points to: OTHER/UNKNOWN`);
                }
            } catch (e) {
                console.log(`Resolution error: ${e.message}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n📋 Recommendations:');
    console.log('===================');
    console.log('✅ buyprintz.com & www → Should point to Vercel (frontend)');
    console.log('🔧 api.buyprintz.com → Should point to Railway (backend)');
    console.log('');
    console.log('If api.buyprintz.com points to Vercel:');
    console.log('  1. Go to your domain registrar DNS settings');
    console.log('  2. Find the CNAME record for "api"');
    console.log('  3. Change it from Vercel to Railway CNAME');
    console.log('  4. Railway CNAME format: your-service.railway.app');
}

checkDNS().catch(console.error);
