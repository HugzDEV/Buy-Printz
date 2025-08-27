# BuyPrintz Supabase Email Configuration Guide

## 🎯 Issues to Fix:
1. **Wrong Redirect URL**: Emails redirect to localhost:3000 instead of buyprintz.com
2. **Generic Branding**: Emails show Supabase branding instead of BuyPrintz

## ✅ Solution 1: Fixed Redirect URL (DONE)
- Updated `emailRedirectTo` in auth.js to use `window.location.origin/dashboard`
- This ensures users are redirected to buyprintz.com after email confirmation

## 🎨 Solution 2: Custom Email Templates

### Step 1: Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your BuyPrintz project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Customize Confirmation Email Template

**Subject Line:**
```
Welcome to BuyPrintz - Confirm Your Email
```

**Email Template (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BuyPrintz</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .button {
            display: inline-block;
            background-color: #00D755;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-radius: 0 0 8px 8px;
        }
        .highlight {
            color: #00D755;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BuyPrintz</div>
            <p>Professional Banner Printing</p>
        </div>
        
        <div class="content">
            <h2>Welcome to BuyPrintz! 🎉</h2>
            
            <p>Thank you for creating your account with BuyPrintz - your go-to platform for professional banner printing with <span class="highlight">lightning-fast 2-3 business day delivery</span>.</p>
            
            <p>To get started with designing amazing banners, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm Email & Start Designing</a>
            </div>
            
            <p>Once confirmed, you'll have access to:</p>
            <ul>
                <li>✨ Professional design tools</li>
                <li>⚡ 2-3 business day delivery</li>
                <li>🎯 Custom vinyl, mesh, and blockout banners</li>
                <li>💯 Quality guarantee</li>
            </ul>
            
            <p>If you didn't create this account, you can safely ignore this email.</p>
            
            <p>Ready to create your perfect banner?</p>
            <p><strong>The BuyPrintz Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2024 BuyPrintz. All rights reserved.</p>
            <p>Professional banner printing with fast delivery.</p>
            <p>If you need help, contact us at support@buyprintz.com</p>
        </div>
    </div>
</body>
</html>
```

### Step 3: Update Site URL in Supabase
1. Go to **Settings** → **General**
2. Update **Site URL** to: `https://buyprintz.com`
3. Add **Redirect URLs**:
   - `https://buyprintz.com/dashboard`
   - `https://buyprintz.com/**` (for broader redirects)

### Step 4: Test Email Flow
1. Create a test account from buyprintz.com/register
2. Check email for BuyPrintz branding
3. Verify redirect goes to buyprintz.com/dashboard
4. Confirm user can access dashboard after confirmation

## 🎨 Additional Templates to Customize:

### Password Reset Email
**Subject:** `Reset Your BuyPrintz Password`

### Magic Link Email  
**Subject:** `Sign in to Your BuyPrintz Account`

### Email Change Confirmation
**Subject:** `Confirm Your New Email - BuyPrintz`

## 🔧 Advanced Settings:
- **Rate Limiting**: Configure to prevent spam
- **SMTP Settings**: Optional custom SMTP provider
- **Email Validation**: Enable additional email validation

## ✅ Expected Results:
- ✅ Emails redirect to buyprintz.com instead of localhost
- ✅ Professional BuyPrintz branding in all emails
- ✅ Consistent green button colors matching brand
- ✅ Clear messaging about 2-3 day delivery promise
- ✅ Better user experience and trust

## 📞 Support:
If you need help with Supabase configuration:
- Supabase Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- BuyPrintz Support: support@buyprintz.com
