# Database Recovery Guide for BuyPrintz

## Step 1: Identify What Was Changed

1. **Run the diagnostic SQL script** (`check_database_tables.sql`) in your Supabase SQL editor
2. **Compare with expected tables** (see `expected_tables.md`)
3. **Identify which tables are missing or renamed**

## Step 2: Recovery Options

### Option A: Rename Tables Back (Recommended)
If you just renamed tables, we can rename them back:

```sql
-- Example: If you renamed 'orders' to 'order_history'
ALTER TABLE order_history RENAME TO orders;

-- Example: If you renamed 'creators' to 'creator_users'  
ALTER TABLE creator_users RENAME TO creators;
```

### Option B: Update Code to Match New Names
If you want to keep the new names, we can update the code:

1. **Update backend/database.py** - Change all `.table("old_name")` to `.table("new_name")`
2. **Update backend/admin_api.py** - Change table references
3. **Update backend/creator_marketplace.py** - Change table references
4. **Update backend/main.py** - Change table references

### Option C: Recreate Missing Tables
If tables were deleted, we can recreate them using existing schema files.

## Step 3: Quick Fix Commands

### Check Current Status
```sql
-- See what tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### Common Table Renames to Check
```sql
-- Check for common variations
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
AND (
    tablename LIKE '%order%' OR
    tablename LIKE '%creator%' OR  
    tablename LIKE '%template%' OR
    tablename LIKE '%user%' OR
    tablename LIKE '%canvas%'
);
```

## Step 4: Test Application

After fixing, test these key functions:
1. **User login/registration**
2. **Template creation**
3. **Order creation**
4. **Creator marketplace**
5. **Admin portal**

## Step 5: Get Help

If you're unsure what was changed, please:
1. Run the diagnostic SQL script
2. Share the results with me
3. I can help identify exactly what needs to be fixed

## Emergency Recovery

If the application is completely broken:
1. **Don't panic** - we can fix this
2. **Don't delete anything else** - we need to see what exists
3. **Run the diagnostic script first**
4. **Share the results** - I'll help you restore functionality quickly
