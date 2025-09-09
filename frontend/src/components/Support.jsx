import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronRight,
  Home,
  Palette,
  ShoppingCart,
  Users,
  Settings,
  CreditCard,
  Download,
  Upload,
  Shield,
  Clock
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

const Support = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [expandedSitemap, setExpandedSitemap] = useState(null)

  const faqData = [
    {
      id: 1,
      question: "How do I create a design?",
      answer: "Use our design editor to create custom banners, business card tins, or tradeshow tents. Start by selecting your product type, then use our tools to add text, images, and graphics. You can also browse our marketplace for professional templates."
    },
    {
      id: 2,
      question: "What file formats do you accept?",
      answer: "We accept JPEG, PNG, PDF, and AI files. For best results, use high-resolution images (300 DPI minimum for print quality). Our design editor also supports direct text and shape creation."
    },
    {
      id: 3,
      question: "How long does production take?",
      answer: "Standard production time is 3-5 business days for banners, 5-7 business days for business card tins, and 7-10 business days for tradeshow tents. Rush orders are available for an additional fee."
    },
    {
      id: 4,
      question: "Can I purchase marketplace templates?",
      answer: "Yes! Browse our marketplace for professional templates created by our design team. Templates are priced from $0.99 to $1.99 and can be used in your designs. Purchased templates are automatically added to your order total."
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover) through our secure Stripe payment processing. All payments are encrypted and secure."
    },
    {
      id: 6,
      question: "Do you offer shipping?",
      answer: "Yes, we offer standard shipping (5-7 days), express shipping (2-3 days), and overnight shipping (1 day). Shipping costs are calculated at checkout based on your location and order size."
    },
    {
      id: 7,
      question: "Can I track my order?",
      answer: "Yes, once your order is placed, you'll receive a confirmation email with tracking information. You can also log into your account to view order status and tracking details."
    },
    {
      id: 8,
      question: "What's your refund policy?",
      answer: "Defective products will be reprinted at no charge. Design errors approved by the customer are non-refundable. Custom orders are generally non-refundable unless defective. Shipping costs are non-refundable except for our errors."
    },
    {
      id: 9,
      question: "How do I save my designs?",
      answer: "Your designs are automatically saved as you work. You can also manually save designs to your dashboard for future use. Saved designs can be loaded back into the editor for modifications or reorders."
    },
    {
      id: 10,
      question: "Can I get a sample before ordering?",
      answer: "We offer sample swatches for most banner materials. Contact us to request samples. For business card tins and tents, we can provide material samples and color swatches."
    }
  ]

  const sitemapData = [
    {
      title: "Main Pages",
      icon: Home,
      links: [
        { name: "Home", path: "/", description: "Landing page with product overview" },
        { name: "Products", path: "/#products", description: "View all available products" },
        { name: "Contact", path: "/#contact", description: "Get in touch with our team" }
      ]
    },
    {
      title: "Design & Creation",
      icon: Palette,
      links: [
        { name: "Design Tool", path: "/editor", description: "Create custom designs" },
        { name: "Marketplace", path: "/marketplace", description: "Browse professional templates" },
        { name: "Templates", path: "/dashboard", description: "Manage your saved designs" }
      ]
    },
    {
      title: "Account & Orders",
      icon: Users,
      links: [
        { name: "Dashboard", path: "/dashboard", description: "View orders and designs" },
        { name: "Login", path: "/login", description: "Sign in to your account" },
        { name: "Register", path: "/register", description: "Create a new account" }
      ]
    },
    {
      title: "Checkout & Payment",
      icon: CreditCard,
      links: [
        { name: "Banner Checkout", path: "/checkout", description: "Complete banner orders" },
        { name: "Tin Checkout", path: "/tin-checkout", description: "Complete tin orders" },
        { name: "Tent Checkout", path: "/tent-checkout", description: "Complete tent orders" }
      ]
    },
    {
      title: "Legal & Support",
      icon: Shield,
      links: [
        { name: "Terms of Service", path: "/terms", description: "Platform terms and conditions" },
        { name: "Privacy Policy", path: "/privacy", description: "Data protection and privacy" },
        { name: "Support", path: "/support", description: "Help and FAQ" }
      ]
    }
  ]

  const filteredFaq = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const toggleSitemap = (title) => {
    setExpandedSitemap(expandedSitemap === title ? null : title)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, explore our platform, and get the help you need.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search and Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search FAQ
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Need More Help?
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <a href="mailto:order@buyprintz.com" className="text-blue-600 hover:text-blue-800">
                      order@buyprintz.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <a href="tel:+16175050603" className="text-green-600 hover:text-green-800">
                      (617) 505-0603
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {filteredFaq.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sitemap Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Platform Sitemap
              </h2>
              
              <div className="space-y-4">
                {sitemapData.map((section) => {
                  const Icon = section.icon
                  return (
                    <div key={section.title} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleSitemap(section.title)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">{section.title}</span>
                        </div>
                        {expandedSitemap === section.title ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSitemap === section.title && (
                        <div className="px-6 pb-4">
                          <div className="space-y-3">
                            {section.links.map((link, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <Link 
                                    to={link.path} 
                                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    {link.name}
                                  </Link>
                                  <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Support
