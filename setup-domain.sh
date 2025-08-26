#!/bin/bash

# BuyPrintz.com Domain Setup Script
echo "🌐 BuyPrintz.com Domain Setup Guide"
echo "=================================="
echo ""

echo "1️⃣ VERCEL SETUP (Frontend)"
echo "→ Go to: https://vercel.com/dashboard"
echo "→ Select your BuyPrintz project"
echo "→ Settings → Domains → Add Domain"
echo "→ Add: buyprintz.com"
echo "→ Add: www.buyprintz.com"
echo ""

echo "2️⃣ RAILWAY SETUP (Backend)" 
echo "→ Go to: https://railway.app/dashboard"
echo "→ Select your backend service"
echo "→ Settings → Public Networking → + Custom Domain"
echo "→ Add: api.buyprintz.com"
echo ""

echo "3️⃣ DNS CONFIGURATION"
echo "Add these records to your domain registrar:"
echo ""
echo "Type    | Name | Value                     | TTL"
echo "--------|------|---------------------------|----- "
echo "A       | @    | [Vercel IP from step 1]  | 3600"
echo "CNAME   | www  | cname.vercel-dns.com     | 3600"
echo "CNAME   | api  | [Railway URL from step 2]| 3600"
echo ""

echo "4️⃣ VERCEL ENVIRONMENT VARIABLES"
echo "Add these to your Vercel project settings:"
echo "VITE_API_URL=https://api.buyprintz.com"
echo "VITE_SITE_URL=https://buyprintz.com"
echo ""

echo "5️⃣ RAILWAY ENVIRONMENT VARIABLES"
echo "Add these to your Railway service:"
echo "FRONTEND_URL=https://buyprintz.com"
echo ""

echo "6️⃣ VERIFICATION (After 24-48 hours)"
echo "✅ Test: https://buyprintz.com"
echo "✅ Test: https://www.buyprintz.com"
echo "✅ Test: https://api.buyprintz.com/health"
echo ""

echo "📖 For detailed instructions, see: DOMAIN_SETUP.md"
