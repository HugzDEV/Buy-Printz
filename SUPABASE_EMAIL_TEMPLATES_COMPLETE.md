# Complete BuyPrintz Email Templates for Supabase

## 🎯 Setup Instructions:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your BuyPrintz project
3. Navigate to **Authentication** → **Email Templates**
4. Replace each template with the corresponding template below

---

## 📧 1. Confirm Signup Email Template

**Subject:**
```
Welcome to BuyPrintz - Confirm Your Email
```

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BuyPrintz</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #00D755; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        .highlight { color: #00D755; font-weight: bold; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
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

---

## 🔐 2. Reset Password Email Template

**Subject:**
```
Reset Your BuyPrintz Password
```

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your BuyPrintz Password</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #00D755; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        .warning { background-color: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404; }
        .highlight { color: #00D755; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BuyPrintz</div>
            <p>Professional Banner Printing</p>
        </div>
        
        <div class="content">
            <h2>Reset Your Password 🔐</h2>
            
            <p>You requested to reset your password for your BuyPrintz account. No worries - it happens to the best of us!</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email or contact our support team.
            </div>
            
            <p>Once you've reset your password, you can continue creating professional banners with our <span class="highlight">2-3 business day delivery guarantee</span>.</p>
            
            <p>Need help? Our support team is here for you at support@buyprintz.com</p>
            
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

---

## 🔗 3. Magic Link Email Template

**Subject:**
```
Sign in to Your BuyPrintz Account - Magic Link
```

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to BuyPrintz</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #00D755; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        .info-box { background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 6px; margin: 20px 0; color: #1565c0; }
        .highlight { color: #00D755; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BuyPrintz</div>
            <p>Professional Banner Printing</p>
        </div>
        
        <div class="content">
            <h2>Quick Sign In to BuyPrintz ⚡</h2>
            
            <p>You requested a magic link to sign in to your BuyPrintz account. Click the button below to access your dashboard instantly:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Sign In to BuyPrintz</a>
            </div>
            
            <div class="info-box">
                <strong>💡 What's waiting for you:</strong><br>
                • Your saved banner designs<br>
                • Order history and tracking<br>
                • Professional design tools<br>
                • <span class="highlight">2-3 business day delivery</span> on all orders
            </div>
            
            <p>This link will expire in 1 hour for security reasons. If you didn't request this sign-in link, you can safely ignore this email.</p>
            
            <p>Ready to create amazing banners?</p>
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

---

## 📧 4. Email Change Confirmation Template

**Subject:**
```
Confirm Your New Email - BuyPrintz
```

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - BuyPrintz</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #00D755; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        .warning { background-color: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #856404; }
        .highlight { color: #00D755; font-weight: bold; }
        .email-box { background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BuyPrintz</div>
            <p>Professional Banner Printing</p>
        </div>
        
        <div class="content">
            <h2>Confirm Your New Email Address 📧</h2>
            
            <p>You requested to change the email address associated with your BuyPrintz account.</p>
            
            <p><strong>New email address:</strong></p>
            <div class="email-box">{{ .Email }}</div>
            
            <p>To complete this change and ensure you continue receiving important updates about your banner orders, please confirm your new email address:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> If you didn't request this email change, please contact our support team immediately at support@buyprintz.com to secure your account.
            </div>
            
            <p>After confirmation, you'll continue to receive:</p>
            <ul>
                <li>Order confirmations and tracking updates</li>
                <li>Design save notifications</li>
                <li>Delivery updates for your <span class="highlight">2-3 business day</span> orders</li>
                <li>Important account security notifications</li>
            </ul>
            
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

---

## 🔄 5. Invite User Email Template (if using invitations)

**Subject:**
```
You've Been Invited to BuyPrintz - Professional Banner Printing
```

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to BuyPrintz</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1d4ed8, #1e40af); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background-color: #00D755; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
        .highlight { color: #00D755; font-weight: bold; }
        .benefits { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 6px; margin: 20px 0; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BuyPrintz</div>
            <p>Professional Banner Printing</p>
        </div>
        
        <div class="content">
            <h2>You're Invited to BuyPrintz! 🎉</h2>
            
            <p>Someone has invited you to join BuyPrintz - the professional banner printing platform with <span class="highlight">lightning-fast 2-3 business day delivery</span>.</p>
            
            <p>Accept your invitation to start creating amazing banners today:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation & Sign Up</a>
            </div>
            
            <div class="benefits">
                <h3 style="margin-top: 0; color: #00D755;">What you'll get with BuyPrintz:</h3>
                <ul>
                    <li>✨ Professional design tools with real-time preview</li>
                    <li>⚡ Super fast 2-3 business day delivery</li>
                    <li>🎯 Premium vinyl, mesh, and blockout banner options</li>
                    <li>💯 Quality guarantee on all orders</li>
                    <li>📱 Easy-to-use online design platform</li>
                    <li>🚚 Free shipping on orders over $50</li>
                </ul>
            </div>
            
            <p>Join thousands of businesses who trust BuyPrintz for their professional signage needs.</p>
            
            <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
            
            <p>Ready to get started?</p>
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

---

## ⚙️ Additional Configuration Settings:

### Site URL Settings (in Supabase Settings > General):
- **Site URL**: `https://buyprintz.com`
- **Redirect URLs**: 
  - `https://buyprintz.com/email-confirmed`
  - `https://buyprintz.com/dashboard`
  - `https://buyprintz.com/**`

### Email Settings Recommendations:
- **From Email**: `noreply@buyprintz.com` (requires domain verification)
- **From Name**: `BuyPrintz Team`
- **Rate Limiting**: Enable to prevent abuse
- **Email Confirmation**: Enabled for new signups

### Testing Checklist:
- [ ] Test signup confirmation email
- [ ] Test password reset email  
- [ ] Test magic link signin
- [ ] Test email change confirmation
- [ ] Verify all emails redirect to buyprintz.com
- [ ] Check mobile email rendering
- [ ] Confirm brand colors display correctly

Now all your Supabase emails will have professional BuyPrintz branding! 🎯✨
