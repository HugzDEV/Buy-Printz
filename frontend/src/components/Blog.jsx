import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Clock
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

const Blog = () => {

  const blogPosts = [
    {
      id: 2,
      title: "Why Your Business Card is Failing You (And What Smart Entrepreneurs Do Instead)",
      excerpt: "Every day, thousands of business cards end up in glove compartments, forgotten in wallets, or worse—thrown away. If you're still handing out traditional paper cards, you're literally watching your marketing budget disappear into junk drawers.",
      content: `Every day, thousands of business cards end up in glove compartments, forgotten in wallets, or worse—thrown away. If you're still handing out traditional paper cards, you're literally watching your marketing budget disappear into junk drawers.

## The Problem

Traditional business cards have a 90% failure rate. They're easily lost, forgotten, and provide zero lasting value to recipients. In today's digital world, a piece of paper with your contact info just doesn't cut it anymore.

Think about it: when was the last time you actually kept a business card for more than a week? Most people either throw them away immediately or stuff them in a drawer where they're never seen again. This means you're spending money on marketing materials that have virtually no impact on your business growth.

## The Solution: Business Card Tins

Enter the Business Card Tin—a revolutionary approach that transforms networking forever. Instead of another forgettable card, you're giving prospects:

**A premium, reusable tin with your branding** - The tin itself becomes a valuable item they'll actually use and keep.

**All your contact information and QR code prominently displayed** - Multiple surfaces mean more opportunities to share your details.

**Fresh mints that create an immediate positive association** - Every time they reach for a mint, they're reminded of your business.

**An eco-friendly container they'll actually keep and reuse** - Unlike paper cards that end up in the trash, tins have lasting utility.

## Why It Works

### Memorability
When someone receives a tin instead of a card, it's an instant conversation starter. "Wow, I've never seen anything like this!" This immediate reaction creates a memorable moment that traditional cards simply cannot match.

### Longevity
Long after the mints are gone, your branded tin remains on their desk, in their car, or repurposed for small items—keeping your brand visible. Unlike paper cards that get lost or damaged, tins are durable and functional.

### Professional Impact
It signals that your business thinks differently and invests in quality presentation. This premium approach shows you value your professional relationships and are willing to invest in making a lasting impression.

### Practical Value
The tin serves multiple purposes beyond just holding your contact information. Recipients can use it to store small items, making it a genuinely useful item they'll want to keep.

## Real-World Success Stories

Entrepreneurs who've switched to Business Card Tins report:
- 300% increase in follow-up conversations
- 85% of recipients keep the tin for 6+ months
- 40% improvement in brand recall
- Significant reduction in marketing waste

## The Environmental Advantage

Traditional business cards contribute to massive paper waste. By choosing reusable tins, you're:
- Reducing paper consumption
- Minimizing landfill waste
- Supporting sustainable business practices
- Appealing to environmentally conscious clients

## Getting Started

Ready to make your first impression unforgettable? Our Business Card Tins start with low minimum orders, making them perfect for startups and established businesses alike.

The process is simple:
1. Choose your tin style and size
2. Design your custom branding
3. Select your mint flavor
4. Place your order
5. Start making unforgettable impressions

## Call to Action

Don't let another networking opportunity slip away with a forgettable paper card. Transform your professional networking with Business Card Tins that actually work.

Contact BuyPrintz today to discuss your custom Business Card Tin design. Let's create networking tools that your contacts will remember, use, and talk about.`,
      author: "BuyPrintz Team",
      date: "2025-01-15",
      readTime: "6 min read",
      category: "Business Cards",
      tags: ["business cards", "networking", "entrepreneurship", "marketing", "innovation"],
      thumbnail: "/assets/images/Tins_BC_v2_new phone number.png",
      featured: true
    },
    {
      id: 1,
      title: "Revolutionary Business Cards: Why Business Card Tins Are the Future of Professional Networking",
      excerpt: "Gone are the days when business cards meant flimsy paper rectangles destined for the bottom of a briefcase. Today's professionals need networking tools that make lasting impressions, and we've discovered the perfect solution: custom Business Card Tins.",
      content: `Every year, billions of paper business cards are printed, exchanged, and ultimately discarded. Studies show that 90% of traditional business cards are thrown away within a week of receiving them. Our innovative custom Business Card Tins transform classic hinged containers into memorable, sustainable networking tools that your contacts will actually keep and use.

The tin format offers four distinct surfaces for messaging:
    • Exterior front: Essential contact information
    • Exterior back: QR code and website
    • Interior lid: Brand messaging and taglines
    • Interior bottom: Additional contact details

This multi-surface approach provides significantly more real estate than traditional cards while maintaining a compact, portable format.

Perfect for:
    • Creative professionals
    • Eco-conscious businesses
    • Tech startups
    • Event planners
    • Sales professionals

The practical value ensures your contact information stays visible and accessible, while the eco-friendly approach demonstrates environmental responsibility.`,
      author: "BuyPrintz Team",
      date: "2025-09-09",
      readTime: "8 min read",
      category: "Business Cards",
      tags: ["business cards", "networking", "sustainability", "innovation", "marketing"],
      thumbnail: "/assets/images/Tins_BC_v2_new phone number.png",
      featured: false
    }
  ]

  const featuredPost = blogPosts.find(post => post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">BuyPrintz Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and trends in printing, design, and marketing to help your business stand out.
          </p>
        </div>


        {/* Featured Article */}
        {featuredPost && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.thumbnail}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-80 object-contain bg-gray-50"
                  onError={(e) => {
                    e.target.src = '/assets/images/Blog/placeholder.jpg'
                  }}
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Link
                  to={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Read Full Article
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest insights on printing, design, and marketing delivered to your inbox. 
            Join thousands of professionals who trust BuyPrintz for industry expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Blog
