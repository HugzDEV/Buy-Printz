import React from 'react'
import { Link } from 'react-router-dom'
import { Palette, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="text-white" style={{backgroundColor: '#0E1B4D'}}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <img 
                src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                alt="Buy Printz" 
                className="w-24 h-24 object-contain"
              />
              <span className="text-xl font-bold">Buy Printz</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional banner printing solutions with advanced design tools. 
              Create, customize, and order high-quality banners and signs with our easy-to-use platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/editor" className="text-gray-300 hover:text-white transition-colors">
                  Design Tool
                </Link>
              </li>
              <li>
                <a href="/#products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>order@buyprintz.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>(617) 800-9049</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>816 Morton Street, Boston, MA 02124</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-8 text-center text-gray-300">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 mb-4">
            <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <a href="mailto:order@buyprintz.com" className="text-gray-300 hover:text-white transition-colors">
              Support
            </a>
          </div>
          <p>&copy; 2025 Buy Printz. All rights reserved. | Professional Banner Printing Solutions</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
