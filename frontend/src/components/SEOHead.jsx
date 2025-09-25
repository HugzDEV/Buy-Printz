import { Helmet } from 'react-helmet-async'

const SEOHead = ({ 
  title = "BuyPrintz - Professional Banner Printing | 2-3 Day Delivery",
  description = "Professional banner printing with lightning-fast 2-3 business day delivery. Custom vinyl banners, trade show displays, and outdoor signage with advanced design tools.",
  keywords = "banner printing, custom banners, vinyl banners, trade show banners, outdoor signs, fast printing",
  image = "https://buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png",
  url = "https://buyprintz.com",
  type = "website",
  author = "BuyPrintz",
  structuredData = null
}) => {
  const siteName = "BuyPrintz"
  const twitterHandle = "@BuyPrintz"
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? 
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data, null, 2)}
            </script>
          )) :
          <script type="application/ld+json">
            {JSON.stringify(structuredData, null, 2)}
          </script>
      )}
    </Helmet>
  )
}

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: "BuyPrintz - Professional Banner Printing | 2-3 Day Delivery | Custom Signs",
    description: "Professional banner printing with lightning-fast 2-3 business day delivery. Custom vinyl banners, trade show displays, and outdoor signage with advanced design tools. Order by 12pm for 2-day delivery!",
    keywords: "banner printing, custom banners, vinyl banners, trade show banners, outdoor signs, fast printing, same day printing, business banners, promotional banners",
    url: "https://buyprintz.com"
  },
  
  products: {
    title: "Banner Products & Pricing | BuyPrintz - Professional Printing Services",
    description: "Browse our complete catalog of banner products. 13oz vinyl banners from $25, mesh banners from $30, blockout banners from $35. Fast 2-3 day delivery on all orders.",
    keywords: "banner products, vinyl banner pricing, mesh banner cost, blockout banner prices, custom banner catalog, professional banner printing",
    url: "https://buyprintz.com/products"
  },
  
  editor: {
    title: "Design Tool - Create Custom Banners Online | BuyPrintz",
    description: "Use our advanced design tool to create custom banners online. Professional canvas editor with text, shapes, and color tools. Real-time preview and instant pricing.",
    keywords: "banner design tool, online banner creator, custom banner design, banner editor, design banners online, banner design software",
    url: "https://buyprintz.com/editor"
  },
  
  login: {
    title: "Sign In to Your Account | BuyPrintz - Professional Banner Printing",
    description: "Sign in to your BuyPrintz account to access your designs, track orders, and manage your banner printing projects.",
    keywords: "login, sign in, account access, BuyPrintz account, banner printing account",
    url: "https://buyprintz.com/login"
  },
  
  register: {
    title: "Create Account - Get Started | BuyPrintz - Professional Banner Printing",
    description: "Create your free BuyPrintz account and start designing professional banners today. Save designs, track orders, and get fast 2-3 day delivery.",
    keywords: "create account, sign up, register, new account, BuyPrintz registration, banner printing account",
    url: "https://buyprintz.com/register"
  },
  
  dashboard: {
    title: "Dashboard - Manage Your Orders | BuyPrintz",
    description: "Manage your banner printing orders, track delivery status, and access your saved designs from your BuyPrintz dashboard.",
    keywords: "dashboard, order management, track orders, saved designs, account dashboard",
    url: "https://buyprintz.com/dashboard"
  },
  
  marketplace: {
    title: "Creator Marketplace - Professional Banner Templates | BuyPrintz",
    description: "Browse and purchase professional banner templates from our creator marketplace. High-quality designs for business, events, and promotional use.",
    keywords: "banner templates, marketplace, creator designs, professional templates, banner designs, custom templates",
    url: "https://buyprintz.com/marketplace"
  },
  
  tinskinz: {
    title: "TinSkinz Marketplace - Custom Tin Designs | BuyPrintz",
    description: "Discover unique tin designs in our TinSkinz marketplace. Custom tin wraps, business card tins, and promotional tin products.",
    keywords: "tin designs, tin wraps, business card tins, promotional tins, custom tin products, TinSkinz",
    url: "https://buyprintz.com/tinskinz"
  },
  
  contact: {
    title: "Contact Us - Professional Banner Printing Support | BuyPrintz",
    description: "Get in touch with our professional banner printing team. Expert support for custom designs, fast delivery, and quality printing services.",
    keywords: "contact, support, banner printing help, custom design assistance, printing questions",
    url: "https://buyprintz.com/contact"
  },
  
  blog: {
    title: "Blog - Banner Printing Tips & Industry Insights | BuyPrintz",
    description: "Read our latest blog posts about banner printing, design tips, marketing strategies, and industry insights to help your business grow.",
    keywords: "banner printing blog, design tips, marketing insights, printing industry news, business tips",
    url: "https://buyprintz.com/blog"
  },
  
  terms: {
    title: "Terms of Service | BuyPrintz - Professional Banner Printing",
    description: "Read our terms of service for BuyPrintz professional banner printing services. Clear policies for orders, delivery, and customer rights.",
    keywords: "terms of service, legal terms, banner printing terms, BuyPrintz policies",
    url: "https://buyprintz.com/terms"
  },
  
  privacy: {
    title: "Privacy Policy | BuyPrintz - Professional Banner Printing",
    description: "Learn how BuyPrintz protects your privacy and handles your personal information. Our commitment to data security and privacy.",
    keywords: "privacy policy, data protection, privacy rights, BuyPrintz privacy, information security",
    url: "https://buyprintz.com/privacy"
  },
  
  support: {
    title: "Support Center - Help & FAQ | BuyPrintz",
    description: "Get help with your banner printing orders, design questions, and technical support. Comprehensive FAQ and support resources.",
    keywords: "support, help, FAQ, customer service, banner printing help, technical support",
    url: "https://buyprintz.com/support"
  },
  
  checkout: {
    title: "Checkout - Complete Your Order | BuyPrintz",
    description: "Complete your banner printing order with secure checkout. Review your design, select options, and place your order for fast delivery.",
    keywords: "checkout, order completion, secure payment, banner order, fast delivery",
    url: "https://buyprintz.com/checkout"
  },
  
  confirmation: {
    title: "Order Confirmation - Thank You | BuyPrintz",
    description: "Your banner printing order has been confirmed. Track your order status and expect fast 2-3 business day delivery.",
    keywords: "order confirmation, thank you, order tracking, delivery confirmation",
    url: "https://buyprintz.com/confirmation"
  }
}

export default SEOHead
