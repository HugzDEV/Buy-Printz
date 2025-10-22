import { Helmet } from 'react-helmet-async'

const SEOHead = ({ 
  title = "BuyPrintz - Business Cards, Stickers, Banners & Tents | Custom Printing | 2-3 Day Delivery",
  description = "Professional business cards, custom vinyl stickers, banners, and tradeshow tents with lightning-fast 2-3 business day delivery. Online design tool with blind dropshipping available.",
  keywords = "business cards, custom business cards, business card printing, business card design, vinyl stickers, custom stickers, sticker printing, vinyl decals, banners, custom banners, banner printing, vinyl banners, tents, tradeshow tents, canopy tents, pop-up tents, trade show displays, professional printing, same day printing, fast printing, custom printing, print on demand, online design tool, canvas editor, blind dropshipping, business branding, promotional products, marketing materials, networking tools, professional services, fast delivery, next day shipping",
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
    title: "BuyPrintz - Business Cards, Stickers, Banners & Tents | Custom Printing | 2-3 Day Delivery",
    description: "Professional business cards, custom vinyl stickers, banners, and tradeshow tents with lightning-fast 2-3 business day delivery. Online design tool with blind dropshipping available.",
    keywords: "business cards, custom business cards, business card printing, business card design, vinyl stickers, custom stickers, sticker printing, vinyl decals, banners, custom banners, banner printing, vinyl banners, tents, tradeshow tents, canopy tents, pop-up tents, trade show displays, professional printing, same day printing, fast printing, custom printing, print on demand, online design tool, canvas editor, blind dropshipping, business branding, promotional products, marketing materials, networking tools, professional services, fast delivery, next day shipping",
    url: "https://www.buyprintz.com"
  },
  
  products: {
    title: "All Products - Business Cards, Stickers, Banners & Tents | BuyPrintz",
    description: "Browse our complete catalog: Professional business cards, custom vinyl stickers, banners, and tradeshow tents. Premium printing services with fast 2-3 day delivery.",
    keywords: "business cards, custom business cards, business card printing, business card design, vinyl stickers, custom stickers, sticker printing, vinyl decals, banners, custom banners, banner printing, vinyl banners, tents, tradeshow tents, canopy tents, pop-up tents, trade show displays, professional printing, same day printing, fast printing, custom printing, print on demand, online design tool, canvas editor, blind dropshipping, business branding, promotional products, marketing materials, networking tools, professional services, fast delivery, next day shipping",
    url: "https://www.buyprintz.com/products"
  },
  
  businessCardTins: {
    title: "Business Card Tins - Custom Aluminum Tins with Mints | BuyPrintz",
    description: "Revolutionary Business Card Tins with custom vinyl stickers and fresh mints. Premium aluminum tins that make lasting impressions. Perfect for networking, events, and professional marketing. 100 unit minimum orders.",
    keywords: "business card tins, business cards, custom business cards, aluminum business cards, business card printing, business card design, business card templates, business card ideas, business card alternatives, networking cards, professional business cards, custom business card tins, promotional business cards, business card holders, business card storage, business card cases, custom tins, aluminum tins, fresh mints, networking tools, promotional tins, professional networking, custom vinyl stickers",
    url: "https://www.buyprintz.com/business-card-tins"
  },
  
  tradeshowTents: {
    title: "Tradeshow Tents - Custom Canopy Tents & Pop-Up Displays | BuyPrintz",
    description: "Professional tradeshow tents, canopy tents, and pop-up displays for trade shows, events, and exhibitions. Custom graphics, durable construction, and easy setup. Perfect for trade shows, farmers markets, and outdoor events.",
    keywords: "tradeshow tents, canopy tents, pop-up displays, trade show booths, custom tents, exhibition displays, event tents, trade show marketing, pop-up tents, canopy, tradeshow, trade show, exhibition tents, custom canopy, professional tents, event displays, outdoor tents, trade show displays, exhibition booths, custom canopy tents, professional canopy, tradeshow canopy, trade show canopy, event canopy, outdoor canopy, custom pop-up tents, professional pop-up displays, trade show graphics, exhibition graphics, custom tent graphics, professional tent printing, tradeshow printing, trade show printing, canopy printing, tent printing, fast tent delivery, same day tent printing",
    url: "https://www.buyprintz.com/tradeshow-tents"
  },
  
  stickers: {
    title: "Custom Stickers - Vinyl Stickers, Decals & Sticker Printing | BuyPrintz",
    description: "Professional custom vinyl stickers, decals, and sticker printing. Weather-resistant, durable stickers for business, events, and personal use. 8 shapes, Roland premium materials, die-cut and kiss-cut options. Fast 2-3 day delivery.",
    keywords: "custom stickers, vinyl stickers, sticker printing, vinyl decals, custom decals, die cut stickers, kiss cut stickers, gang sheet stickers, roland premium vinyl, sticker design, business stickers, promotional stickers, custom sticker printing, vinyl sticker printing, professional stickers, weather resistant stickers, durable stickers, custom decal printing, vinyl decal printing, sticker shapes, custom sticker shapes, professional sticker printing, fast sticker delivery, same day sticker printing",
    url: "https://www.buyprintz.com/stickers"
  },
  
  editor: {
    title: "Design Tool - Create Business Card Tins, Tents & Banners Online | BuyPrintz",
    description: "Use our advanced design tool to create custom Business Card Tins, Tradeshow Tents, and banners online. Professional canvas editor with text, shapes, and color tools. Real-time preview and instant pricing.",
    keywords: "design tool, business card tin designer, business card designer, business card design tool, tradeshow tent designer, banner design tool, online creator, custom design, canvas editor, design software, business card maker, business card creator",
    url: "https://www.buyprintz.com/editor"
  },
  
  login: {
    title: "Sign In to Your Account | BuyPrintz - Business Card Tins, Tents & Banners",
    description: "Sign in to your BuyPrintz account to access your designs, track orders, and manage your Business Card Tins, Tradeshow Tents, and banner printing projects.",
    keywords: "login, sign in, account access, BuyPrintz account, business card tins, tradeshow tents, banner printing account",
    url: "https://www.buyprintz.com/login"
  },
  
  register: {
    title: "Create Account - Get Started | BuyPrintz - Business Card Tins, Tents & Banners",
    description: "Create your free BuyPrintz account and start designing Business Card Tins, Tradeshow Tents, and banners today. Save designs, track orders, and get fast 2-3 day delivery.",
    keywords: "create account, sign up, register, new account, BuyPrintz registration, business card tins, tradeshow tents, banner printing account",
    url: "https://www.buyprintz.com/register"
  },
  
  dashboard: {
    title: "Dashboard - Manage Your Orders | BuyPrintz",
    description: "Manage your Business Card Tins, Tradeshow Tents, and banner printing orders. Track delivery status and access your saved designs from your BuyPrintz dashboard.",
    keywords: "dashboard, order management, track orders, saved designs, business card tins, tradeshow tents, banner orders, account dashboard",
    url: "https://www.buyprintz.com/dashboard"
  },
  
  marketplace: {
    title: "Creator Marketplace - Professional Templates | BuyPrintz",
    description: "Browse and purchase professional templates for Business Card Tins, Tradeshow Tents, and banners from our creator marketplace. High-quality designs for business, events, and promotional use.",
    keywords: "templates, marketplace, creator designs, business card tin templates, business card templates, tradeshow tent templates, banner templates, professional designs, custom templates, business card design templates",
    url: "https://www.buyprintz.com/marketplace"
  },
  
  tinskinz: {
    title: "TinSkinz Marketplace - Custom Tin Designs | BuyPrintz",
    description: "Discover unique tin designs in our TinSkinz marketplace. Custom tin wraps, business card tins, and promotional tin products.",
    keywords: "tin designs, tin wraps, business card tins, promotional tins, custom tin products, TinSkinz",
    url: "https://www.buyprintz.com/tinskinz"
  },
  
  contact: {
    title: "Contact Us - Business Card Tins, Tents & Banner Support | BuyPrintz",
    description: "Get in touch with our professional team for Business Card Tins, Tradeshow Tents, and banner printing support. Expert assistance for custom designs, fast delivery, and quality services.",
    keywords: "contact, support, business card tins help, tradeshow tents help, banner printing help, custom design assistance, printing questions",
    url: "https://www.buyprintz.com/contact"
  },
  
  blog: {
    title: "Blog - Business Card Tins, Tents & Marketing Tips | BuyPrintz",
    description: "Read our latest blog posts about Business Card Tins, Tradeshow Tents, banner printing, design tips, marketing strategies, and industry insights to help your business grow.",
    keywords: "business card tins blog, tradeshow tents blog, banner printing blog, design tips, marketing insights, networking tools, promotional products, business tips",
    url: "https://www.buyprintz.com/blog"
  },
  
  terms: {
    title: "Terms of Service | BuyPrintz - Business Card Tins, Tents & Banners",
    description: "Read our terms of service for BuyPrintz Business Card Tins, Tradeshow Tents, and banner printing services. Clear policies for orders, delivery, and customer rights.",
    keywords: "terms of service, legal terms, business card tins terms, tradeshow tents terms, banner printing terms, BuyPrintz policies",
    url: "https://www.buyprintz.com/terms"
  },
  
  privacy: {
    title: "Privacy Policy | BuyPrintz - Business Card Tins, Tents & Banners",
    description: "Learn how BuyPrintz protects your privacy and handles your personal information for Business Card Tins, Tradeshow Tents, and banner printing services. Our commitment to data security and privacy.",
    keywords: "privacy policy, data protection, privacy rights, BuyPrintz privacy, business card tins privacy, tradeshow tents privacy, information security",
    url: "https://www.buyprintz.com/privacy"
  },
  
  support: {
    title: "Support Center - Help & FAQ | BuyPrintz",
    description: "Get help with your Business Card Tins, Tradeshow Tents, and banner printing orders. Design questions, technical support, and comprehensive FAQ resources.",
    keywords: "support, help, FAQ, customer service, business card tins help, tradeshow tents help, banner printing help, technical support",
    url: "https://www.buyprintz.com/support"
  },
  
  checkout: {
    title: "Checkout - Complete Your Order | BuyPrintz",
    description: "Complete your Business Card Tins, Tradeshow Tents, or banner printing order with secure checkout. Review your design, select options, and place your order for fast delivery.",
    keywords: "checkout, order completion, secure payment, business card tins order, tradeshow tents order, banner order, fast delivery",
    url: "https://www.buyprintz.com/checkout"
  },
  
  confirmation: {
    title: "Order Confirmation - Thank You | BuyPrintz",
    description: "Your Business Card Tins, Tradeshow Tents, or banner printing order has been confirmed. Track your order status and expect fast 2-3 business day delivery.",
    keywords: "order confirmation, thank you, order tracking, business card tins delivery, tradeshow tents delivery, banner delivery confirmation",
    url: "https://www.buyprintz.com/confirmation"
  }
}

export default SEOHead
