import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Tag,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

const BlogPost = () => {
  const { id } = useParams()

  // In a real app, this would fetch from an API
  const blogPosts = [
    {
      id: 1,
      title: "Revolutionary Business Cards: Why Business Card Tins Are the Future of Professional Networking",
      content: `Gone are the days when business cards meant flimsy paper rectangles destined for the bottom of a briefcase or, worse, the washing machine. Today's professionals need networking tools that make lasting impressions, and we've discovered the perfect solution: custom Business Card Tins.

## The Problem with Traditional Business Cards

Every year, billions of paper business cards are printed, exchanged, and ultimately discarded. Studies show that 90% of traditional business cards are thrown away within a week of receiving them. The remaining 10% often meet their demise in washing machines, coffee spills, or forgotten pockets.

For environmentally conscious businesses and professionals who want to stand out, there has to be a better way.

## Enter the Business Card Tin Revolution

Our innovative custom Business Card Tins transform classic hinged containers into memorable, sustainable networking tools that your contacts will actually keep and use.

### Here's How It Works:

Front of the Tin:
    Your essential contact information is professionally printed directly onto the tin's surface. Company name, your name, title, phone number, and email address are displayed with crisp, durable printing that won't fade or wear off.

Back of the Tin:
    A custom QR code links directly to your digital business card, website, LinkedIn profile, or any destination you choose. This bridges the gap between physical and digital networking seamlessly.

Inside the Tin:
    Fresh mints or branded candy create an immediate positive association with your brand. Every time they reach for a mint, they're reminded of your business.

Inside Lid Surface:
    Additional messaging space for taglines, motivational quotes, or branding elements like "Business Card Revolution" with your website URL, creating multiple brand touchpoints in a single networking tool.

## Why Business Card Tins Work

### 1. Unforgettable First Impressions
When you hand someone a sleek, custom tin instead of a paper card, you immediately differentiate yourself from every other professional they'll meet that day. The tactile experience and unexpected format create a memorable moment that traditional cards simply can't match.

### 2. Practical Value = Lasting Power
Unlike paper cards that serve a single purpose, Business Card Tins provide ongoing utility. Recipients use them to hold mints, small items, or even as a conversation starter. This practical value ensures your contact information stays visible and accessible.

### 3. Eco-Friendly Networking
Made from recycled materials, tin containers are inherently sustainable. By repurposing these containers, you're demonstrating environmental responsibility while reducing waste. For green-conscious businesses and clients, this alignment with sustainability values can be a significant differentiator.

### 4. Multiple Brand Touchpoints
The tin format offers four distinct surfaces for messaging:
    • Exterior front: Essential contact information
    • Exterior back: QR code and website
    • Interior lid: Brand messaging like "Business Card Revolution" or company taglines
    • Interior bottom: Additional contact details, social media handles, or motivational quotes

This multi-surface approach provides significantly more real estate than traditional cards while maintaining a compact, portable format.

### 5. QR Code Integration
The QR code on the back seamlessly connects physical networking with digital platforms. Recipients can instantly access your website, portfolio, or social profiles without manually entering information. This modern touch shows you understand current technology trends.

### 6. Cost-Effective Marketing
While the initial investment may be slightly higher than paper cards, the extended lifespan and multiple touchpoints provide superior return on investment:
    • Initial exchange impact
    • Ongoing tin use
    • Interior messaging discovery
    • Brand reinforcement through utility

## Perfect Applications for Business Card Tins

Creative Professionals:
    Graphic designers, photographers, and artists can showcase their innovative thinking from the first handshake.

Eco-Conscious Businesses:
    Companies with sustainability missions can demonstrate their values tangibly.

Tech Startups:
    The QR code integration appeals to tech-savvy audiences and demonstrates digital fluency.

Event Planners:
    The memorable format aligns perfectly with creating unforgettable experiences.

Sales Professionals:
    In competitive markets, standing out is crucial for making quota and building relationships.

## Design Considerations for Maximum Impact

### Typography and Layout
Clean, readable fonts ensure contact information remains legible on the curved tin surface. Strategic use of white space prevents overcrowding while maintaining professional appearance.

### Interior Surface Design
The inside lid offers premium real estate for memorable messaging. Examples include:
    • "Business Card Revolution" with buyprintz.com
    • Company taglines or mission statements
    • Inspirational quotes aligned with your brand values
    • Secondary contact information or social handles

### Color Psychology
Choose colors that align with your brand while ensuring sufficient contrast for readability. Consider how colors will appear in different lighting conditions and against the metallic tin surface.

### QR Code Placement
Position QR codes for easy scanning while maintaining visual balance. Include a small call-to-action like "Scan for digital card" to encourage interaction.

## The Environmental Impact

Traditional business card production consumes millions of trees annually and generates significant paper waste. By choosing recycled tin containers, professionals can:

    • Reduce paper consumption
    • Minimize landfill waste
    • Support circular economy principles
    • Appeal to environmentally conscious clients and partners

## Getting Started with Custom Business Card Tins

Creating these innovative networking tools requires specialized printing expertise and attention to detail. The process involves:

1. Design Consultation:
    Working with experienced designers to optimize your layout for the unique tin format

2. Material Selection:
    Choosing appropriate printing methods for durability and visual appeal

3. QR Code Programming:
    Setting up trackable, updateable digital destinations

4. Quality Testing:
    Ensuring print quality and scanning functionality before production

5. Mint Selection:
    Choosing complementary candy or mint options that align with your brand

## Measuring Success

Track the effectiveness of your Business Card Tins through:
    • QR code scan analytics
    • Follow-up conversation rates
    • Social media mentions and shares
    • Client retention and referral rates

## The Future of Professional Networking

As digital communication continues to dominate business interactions, the value of memorable physical touchpoints increases. Business Card Tins represent the evolution of networking tools – combining sustainability, functionality, and innovation in a format that recipients actually want to keep.

For printing companies and professionals ready to make lasting impressions, custom Business Card Tins offer a competitive advantage that traditional paper simply cannot match.

## Ready to Transform Your Networking Game?

Contact BuyPrintz.com today to discuss creating custom Business Card Tins that reflect your brand's innovation and environmental consciousness. Let's design networking tools that your contacts will remember, use, and talk about.`,
      author: "BuyPrintz Team",
      date: "2025-09-09",
      readTime: "8 min read",
      category: "Business Cards",
      tags: ["business cards", "networking", "sustainability", "innovation", "marketing"],
      thumbnail: "/assets/images/Tins_BC_v2_new phone number.png",
      excerpt: "Gone are the days when business cards meant flimsy paper rectangles destined for the bottom of a briefcase. Today's professionals need networking tools that make lasting impressions, and we've discovered the perfect solution: custom Business Card Tins."
    }
  ]

  const post = blogPosts.find(p => p.id === parseInt(id))

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-blue-600 hover:text-blue-800 underline">
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{paragraph.slice(3)}</h2>
      } else if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">{paragraph.slice(4)}</h3>
      } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return <p key={index} className="text-gray-700 leading-relaxed mb-4 font-semibold">{paragraph.slice(2, -2)}</p>
      } else if (paragraph.trim() === '') {
        return <br key={index} />
      } else if (paragraph.startsWith('- ')) {
        return <li key={index} className="text-gray-700 leading-relaxed mb-2">{paragraph.slice(2)}</li>
      } else {
        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-64 md:h-96 object-contain bg-gray-50"
            onError={(e) => {
              e.target.src = '/assets/images/Blog/placeholder.jpg'
            }}
          />
          
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <User className="w-4 h-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              <span className="text-sm text-gray-600">Share this article:</span>
              <div className="flex gap-2">
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="p-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {formatContent(post.content)}
            </div>

            {/* Call to Action */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-700 mb-6">
                Transform your networking game with custom Altoids tin business cards. 
                Contact our team today to discuss your design and get a quote.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/#contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Get a Quote
                </Link>
                <Link
                  to="/tin-products"
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  View Tin Products
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/blog" className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/assets/images/Blog/placeholder.jpg"
                alt="Related article"
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">The Complete Guide to Tradeshow Tent Design</h3>
                <p className="text-gray-600 text-sm">Learn how to design eye-catching displays that draw crowds...</p>
              </div>
            </Link>
            <Link to="/blog" className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img
                src="/assets/images/Blog/placeholder.jpg"
                alt="Related article"
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">Banner Design Best Practices</h3>
                <p className="text-gray-600 text-sm">Creating eye-catching displays that convert...</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BlogPost
