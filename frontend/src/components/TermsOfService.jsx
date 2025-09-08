import React from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Buy Printz ("Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Buy Printz provides an online platform for designing and ordering custom banners and signage. 
                Our services include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Online design editor for creating custom banners</li>
                <li>Professional printing services</li>
                <li>Order management and tracking</li>
                <li>Customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Design Content and Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of the designs you create using our platform. However, you grant Buy Printz:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>A license to reproduce your designs for printing purposes</li>
                <li>The right to store your designs for order fulfillment</li>
                <li>Permission to use anonymized design data for service improvement</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You warrant that your designs do not infringe on third-party intellectual property rights and 
                comply with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Orders and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By placing an order, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Pay all charges associated with your order</li>
                <li>Provide accurate billing and shipping information</li>
                <li>Accept our current pricing and delivery terms</li>
                <li>Review and approve designs before production</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Refunds and Returns</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our refund policy:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Defective products will be reprinted at no charge</li>
                <li>Design errors approved by customer are non-refundable</li>
                <li>Custom orders are generally non-refundable unless defective</li>
                <li>Shipping costs are non-refundable except for our errors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to use our service for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Illegal, harmful, or offensive content</li>
                <li>Infringing on intellectual property rights</li>
                <li>Spam, malware, or other malicious activities</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Buy Printz shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other intangible 
                losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
                , which also governs your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting. Your continued use of the service constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 text-gray-700 space-y-2">
                <p><strong>Email:</strong> <a href="mailto:order@buyprintz.com" className="text-blue-600 hover:text-blue-800 underline">order@buyprintz.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+16179020969" className="text-blue-600 hover:text-blue-800 underline">(617) 902-0969</a></p>
                <p><strong>Address:</strong> Boston, MA 02124</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-600">
              <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
                Return to Buy Printz
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TermsOfService
