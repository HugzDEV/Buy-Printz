import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Palette, Menu, X, User, LogOut } from 'lucide-react'
import authService from '../services/auth'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting current user:', error)
        setUser(null)
      }
    }
    getCurrentUser()
  }, [location])

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Design', href: '/editor' },
    { name: 'Products', href: '/all-products' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Contact', href: '/contact' }
  ]

  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Design', href: '/editor' },
    { name: 'Products', href: '/all-products' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Contact', href: '/contact' }
  ]

  const currentNavigation = user ? authenticatedNavigation : navigation

  return (
    <header className="shadow-sm" style={{backgroundColor: '#0E1B4D'}}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
              alt="Buy Printz" 
              className="w-28 h-28 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (item.href === '/editor') {
                    sessionStorage.setItem('newDesign', 'true')
                  }
                }}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-white font-semibold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA/Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-300">Welcome, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-800 text-white transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700">
            <nav className="flex flex-col space-y-4">
              {currentNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (item.href === '/editor') {
                      sessionStorage.setItem('newDesign', 'true')
                    }
                    setMobileMenuOpen(false)
                  }}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-blue-700">
                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-blue-700 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-white text-blue-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors w-full text-center block"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
