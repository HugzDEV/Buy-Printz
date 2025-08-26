# GoDaddy DNS Troubleshooting Guide

## 🔍 Step 1: Find Your DNS Records

In GoDaddy:
1. Go to **DNS Management** for buyprintz.com
2. Look for section showing **all DNS records** (not just NS records)
3. You should see records like A, CNAME, MX, etc.

## 🎯 Step 2: What You Should See

### ✅ Correct Configuration:
```
Type    | Name | Data                      | TTL
--------|------|---------------------------|--------
A       | @    | [Vercel IP]              | 1 Hour
CNAME   | www  | cname.vercel-dns.com     | 1 Hour  
CNAME   | api  | ssrmn57r.up.railway.app  | 30 min ✅
```

### ❌ Common Problems:

**Problem 1 - Wildcard Conflict:**
```
CNAME   | *    | cname.vercel-dns.com     | 1 Hour ❌
```
**Fix**: Delete or modify the wildcard record

**Problem 2 - Missing API Record:**
```
# api record is missing entirely
```
**Fix**: Re-add the CNAME record for api

**Problem 3 - Wrong API Value:**
```
CNAME   | api  | cname.vercel-dns.com     | 30 min ❌
```
**Fix**: Change value to ssrmn57r.up.railway.app

## 🔧 Step 3: Quick Fixes

### If you see a wildcard record (`*`):
1. **Option A**: Delete it (if you don't need it)
2. **Option B**: Change it to be more specific

### If API record is missing:
1. Add new record:
   - Type: CNAME
   - Name: api
   - Value: ssrmn57r.up.railway.app
   - TTL: 30 minutes

### If API record points to Vercel:
1. Edit the existing record
2. Change value from Vercel to Railway

## 📋 Step 4: Verify Changes

After making changes:
1. Wait 5-10 minutes
2. Run: `node quick-dns-test.js`
3. Look for "railway-edge" server

## 🆘 If You're Stuck

Take a screenshot of ALL your DNS records and share it. We need to see:
- All A records
- All CNAME records  
- Any wildcard (*) records
- The specific api record

## ⏱️ Expected Timeline

- **Immediate**: Changes save in GoDaddy
- **5-30 minutes**: Local DNS updates
- **1-4 hours**: Global propagation
- **Max 24 hours**: Full worldwide propagation
