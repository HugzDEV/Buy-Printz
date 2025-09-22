# Creator Marketplace Database Setup

This guide will help you set up the Supabase database tables and policies needed for the BuyPrintz Creator Marketplace functionality.

## 🚀 Quick Setup

### Step 1: Check Current Status
Run this SQL script in your Supabase SQL Editor to check what's already set up:
```sql
-- Copy and paste the contents of check_creator_database_status.sql
```

### Step 2: Run the Database Update
If setup is needed, run this SQL script in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of supabase_creator_marketplace_update.sql
```

## 📋 What Gets Created

### Tables
- **`creators`** - Creator profiles with earnings, ratings, and social links
- **`creator_templates`** - Templates created by creators for the marketplace
- **`template_purchases`** - Purchase records with commission tracking

### Key Features
- ✅ **Row Level Security (RLS)** - Secure access control
- ✅ **Performance Indexes** - Optimized queries
- ✅ **Automatic Triggers** - Real-time stats updates
- ✅ **Data Validation** - Constraints and checks
- ✅ **Commission Tracking** - 80% creator, 20% platform split

## 🔐 Security Features

### Row Level Security Policies
- Users can only view/edit their own creator profiles
- Public can view approved templates only
- Creators can manage their own templates
- Purchase records are private to buyer and creator

### Data Validation
- Display names: 2-50 characters
- Template prices: $3.00-$25.00
- Ratings: 0.00-5.00 scale
- Bio length: max 500 characters

## 📊 Analytics & Tracking

### Automatic Updates
- Creator earnings update on each sale
- Template sales count increments
- View counts track popularity
- Rating calculations maintain averages

### Commission Structure
- **Creator Earnings**: 80% of template price
- **Platform Commission**: 20% of template price
- **Automatic Calculation**: Triggers handle math

## 🛠️ Database Methods Available

The backend includes these creator-related methods:

### Creator Management
- `create_creator()` - Register new creator
- `get_creator_by_user_id()` - Get creator profile
- `get_creator_by_id()` - Get creator by ID
- `update_creator()` - Update creator profile

### Template Management
- `create_creator_template()` - Upload new template
- `get_creator_template()` - Get template details
- `get_creator_templates()` - Get creator's templates
- `get_marketplace_templates()` - Browse marketplace

### Analytics
- `get_creator_analytics()` - Comprehensive stats
- `get_creator_earnings()` - Earnings summary
- `increment_template_views()` - Track popularity

## 🔍 Verification

After running the setup script, verify everything is working:

1. **Check Tables**: All 3 tables should exist
2. **Check RLS**: All tables should have RLS enabled
3. **Check Policies**: Each table should have appropriate policies
4. **Check Triggers**: Automatic update triggers should be active

## 🚨 Troubleshooting

### Common Issues

**"Table already exists"**
- This is normal - the script uses `IF NOT EXISTS`
- Safe to run multiple times

**"Permission denied"**
- Ensure you're using the service role key
- Check your Supabase project permissions

**"RLS policies not working"**
- Verify policies were created correctly
- Check that RLS is enabled on tables

### Getting Help

If you encounter issues:
1. Check the Supabase logs
2. Verify environment variables
3. Test with the status check script
4. Review the error messages in the SQL editor

## 📈 Next Steps

Once the database is set up:

1. **Test Creator Registration** - Try registering as a creator
2. **Upload a Template** - Test the template upload flow
3. **Check Analytics** - Verify earnings tracking works
4. **Test Purchases** - Ensure commission calculations are correct

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Creator dashboard loads without 404 errors
- ✅ Logo uploads work successfully
- ✅ Creator stats display correctly
- ✅ Template marketplace shows approved templates
- ✅ Purchase flow completes with proper commission tracking

---

**Ready to launch your creator marketplace!** 🚀👑✨
