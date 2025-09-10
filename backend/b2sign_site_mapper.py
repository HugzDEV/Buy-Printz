#!/usr/bin/env python3
"""
B2Sign Site Mapper - Discover the actual structure of b2sign.com
This script will analyze b2sign.com to find the real login and quote URLs.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin, urlparse
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignSiteMapper:
    def __init__(self):
        self.base_url = 'https://b2sign.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.discovered_urls = set()
        self.forms_found = []
        self.login_indicators = []
        self.quote_indicators = []
    
    def discover_site_structure(self):
        """Discover the actual structure of b2sign.com"""
        logger.info("🔍 Starting B2Sign site discovery...")
        
        try:
            # Start with the homepage
            self.analyze_page(self.base_url)
            
            # Look for common navigation patterns
            self.find_navigation_links()
            
            # Look for login-related pages
            self.find_login_pages()
            
            # Look for quote/pricing pages
            self.find_quote_pages()
            
            # Analyze all discovered forms
            self.analyze_forms()
            
            # Generate site map
            site_map = self.generate_site_map()
            
            # Save results
            self.save_discovery_results(site_map)
            
            return site_map
            
        except Exception as e:
            logger.error(f"❌ Site discovery failed: {e}")
            return None
    
    def analyze_page(self, url):
        """Analyze a specific page for forms and links"""
        try:
            logger.info(f"📄 Analyzing page: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all forms
            forms = soup.find_all('form')
            for form in forms:
                form_info = self.analyze_form(form, url)
                if form_info:
                    self.forms_found.append(form_info)
            
            # Find all links
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                full_url = urljoin(url, href)
                
                # Only process b2sign.com links
                if 'b2sign.com' in full_url:
                    self.discovered_urls.add(full_url)
                    
                    # Check for login indicators
                    link_text = link.get_text().lower()
                    if any(indicator in link_text for indicator in ['login', 'sign in', 'account', 'my account']):
                        self.login_indicators.append({
                            'url': full_url,
                            'text': link_text,
                            'element': str(link)
                        })
                    
                    # Check for quote indicators
                    if any(indicator in link_text for indicator in ['quote', 'pricing', 'estimate', 'cost', 'price']):
                        self.quote_indicators.append({
                            'url': full_url,
                            'text': link_text,
                            'element': str(link)
                        })
            
            # Look for login forms in the page content
            page_text = soup.get_text().lower()
            if any(indicator in page_text for indicator in ['login', 'sign in', 'username', 'password']):
                logger.info(f"🔐 Found login indicators on: {url}")
            
            if any(indicator in page_text for indicator in ['quote', 'pricing', 'estimate', 'calculate']):
                logger.info(f"💰 Found quote indicators on: {url}")
            
        except Exception as e:
            logger.warning(f"⚠️  Failed to analyze {url}: {e}")
    
    def analyze_form(self, form, page_url):
        """Analyze a form for login/quote functionality"""
        form_info = {
            'page_url': page_url,
            'action': form.get('action', ''),
            'method': form.get('method', 'GET'),
            'fields': [],
            'type': 'unknown'
        }
        
        # Get form action URL
        action_url = urljoin(page_url, form_info['action']) if form_info['action'] else page_url
        form_info['action_url'] = action_url
        
        # Analyze form fields
        inputs = form.find_all(['input', 'select', 'textarea'])
        for input_elem in inputs:
            field_info = {
                'name': input_elem.get('name', ''),
                'type': input_elem.get('type', 'text'),
                'id': input_elem.get('id', ''),
                'placeholder': input_elem.get('placeholder', ''),
                'required': input_elem.has_attr('required')
            }
            form_info['fields'].append(field_info)
        
        # Determine form type
        form_text = form.get_text().lower()
        field_names = [field['name'].lower() for field in form_info['fields']]
        
        # Check for login form indicators
        login_indicators = ['username', 'email', 'password', 'login', 'signin']
        if any(indicator in form_text or indicator in field_names for indicator in login_indicators):
            form_info['type'] = 'login'
            logger.info(f"🔐 Found login form on: {page_url}")
        
        # Check for quote form indicators
        quote_indicators = ['quote', 'pricing', 'estimate', 'calculate', 'width', 'height', 'quantity']
        if any(indicator in form_text or indicator in field_names for indicator in quote_indicators):
            form_info['type'] = 'quote'
            logger.info(f"💰 Found quote form on: {page_url}")
        
        return form_info
    
    def find_navigation_links(self):
        """Find navigation links that might lead to login/quote pages"""
        logger.info("🧭 Looking for navigation links...")
        
        # Common navigation patterns
        nav_patterns = [
            '/login', '/signin', '/account', '/my-account',
            '/quote', '/pricing', '/estimate', '/get-quote',
            '/contact', '/support', '/help'
        ]
        
        for pattern in nav_patterns:
            test_url = urljoin(self.base_url, pattern)
            try:
                response = self.session.head(test_url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ Found accessible URL: {test_url}")
                    self.discovered_urls.add(test_url)
            except:
                pass
    
    def find_login_pages(self):
        """Specifically look for login pages"""
        logger.info("🔐 Searching for login pages...")
        
        # Check common login URLs
        login_urls = [
            '/login', '/signin', '/sign-in', '/account/login',
            '/user/login', '/customer/login', '/client/login'
        ]
        
        for login_url in login_urls:
            full_url = urljoin(self.base_url, login_url)
            try:
                response = self.session.get(full_url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ Found login page: {full_url}")
                    self.analyze_page(full_url)
            except:
                pass
    
    def find_quote_pages(self):
        """Specifically look for quote/pricing pages"""
        logger.info("💰 Searching for quote pages...")
        
        # Check common quote URLs
        quote_urls = [
            '/quote', '/pricing', '/estimate', '/get-quote',
            '/quote-request', '/price-quote', '/custom-quote'
        ]
        
        for quote_url in quote_urls:
            full_url = urljoin(self.base_url, quote_url)
            try:
                response = self.session.get(full_url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ Found quote page: {full_url}")
                    self.analyze_page(full_url)
            except:
                pass
    
    def analyze_forms(self):
        """Analyze all discovered forms"""
        logger.info("📋 Analyzing discovered forms...")
        
        login_forms = [f for f in self.forms_found if f['type'] == 'login']
        quote_forms = [f for f in self.forms_found if f['type'] == 'quote']
        
        logger.info(f"Found {len(login_forms)} login forms")
        logger.info(f"Found {len(quote_forms)} quote forms")
        
        for form in login_forms:
            logger.info(f"🔐 Login form: {form['action_url']}")
            for field in form['fields']:
                logger.info(f"  - {field['name']} ({field['type']})")
        
        for form in quote_forms:
            logger.info(f"💰 Quote form: {form['action_url']}")
            for field in form['fields']:
                logger.info(f"  - {field['name']} ({field['type']})")
    
    def generate_site_map(self):
        """Generate a comprehensive site map"""
        site_map = {
            'base_url': self.base_url,
            'discovered_urls': list(self.discovered_urls),
            'forms': self.forms_found,
            'login_indicators': self.login_indicators,
            'quote_indicators': self.quote_indicators,
            'recommendations': self.generate_recommendations()
        }
        
        return site_map
    
    def generate_recommendations(self):
        """Generate recommendations for the shipping integration"""
        recommendations = {
            'login_url': None,
            'quote_url': None,
            'login_form': None,
            'quote_form': None
        }
        
        # Find best login form
        login_forms = [f for f in self.forms_found if f['type'] == 'login']
        if login_forms:
            # Prefer forms with username/email and password fields
            best_login = None
            for form in login_forms:
                field_names = [f['name'].lower() for f in form['fields']]
                if any(name in ['username', 'email', 'user'] for name in field_names) and 'password' in field_names:
                    best_login = form
                    break
            
            if best_login:
                recommendations['login_form'] = best_login
                recommendations['login_url'] = best_login['page_url']
        
        # Find best quote form
        quote_forms = [f for f in self.forms_found if f['type'] == 'quote']
        if quote_forms:
            # Prefer forms with product-related fields
            best_quote = None
            for form in quote_forms:
                field_names = [f['name'].lower() for f in form['fields']]
                if any(name in ['width', 'height', 'quantity', 'size'] for name in field_names):
                    best_quote = form
                    break
            
            if best_quote:
                recommendations['quote_form'] = best_quote
                recommendations['quote_url'] = best_quote['page_url']
        
        return recommendations
    
    def save_discovery_results(self, site_map):
        """Save discovery results to file"""
        filename = 'b2sign_discovery_results.json'
        with open(filename, 'w') as f:
            json.dump(site_map, f, indent=2)
        
        logger.info(f"💾 Discovery results saved to: {filename}")
        
        # Also save a human-readable summary
        summary_filename = 'b2sign_discovery_summary.txt'
        with open(summary_filename, 'w') as f:
            f.write("B2Sign Site Discovery Summary\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Base URL: {site_map['base_url']}\n")
            f.write(f"Discovered URLs: {len(site_map['discovered_urls'])}\n")
            f.write(f"Forms Found: {len(site_map['forms'])}\n\n")
            
            f.write("RECOMMENDATIONS:\n")
            f.write("-" * 20 + "\n")
            recs = site_map['recommendations']
            f.write(f"Login URL: {recs['login_url'] or 'NOT FOUND'}\n")
            f.write(f"Quote URL: {recs['quote_url'] or 'NOT FOUND'}\n\n")
            
            f.write("DISCOVERED URLS:\n")
            f.write("-" * 20 + "\n")
            for url in sorted(site_map['discovered_urls']):
                f.write(f"- {url}\n")
            
            f.write("\nFORMS:\n")
            f.write("-" * 20 + "\n")
            for form in site_map['forms']:
                f.write(f"Type: {form['type']}\n")
                f.write(f"URL: {form['page_url']}\n")
                f.write(f"Action: {form['action_url']}\n")
                f.write(f"Fields: {len(form['fields'])}\n")
                for field in form['fields']:
                    f.write(f"  - {field['name']} ({field['type']})\n")
                f.write("\n")
        
        logger.info(f"📄 Summary saved to: {summary_filename}")

def main():
    """Run the B2Sign site discovery"""
    logger.info("🚀 Starting B2Sign site discovery...")
    
    mapper = B2SignSiteMapper()
    site_map = mapper.discover_site_structure()
    
    if site_map:
        logger.info("✅ Site discovery completed successfully!")
        
        # Print key findings
        recs = site_map['recommendations']
        logger.info(f"\n📋 KEY FINDINGS:")
        logger.info(f"Login URL: {recs['login_url'] or 'NOT FOUND'}")
        logger.info(f"Quote URL: {recs['quote_url'] or 'NOT FOUND'}")
        logger.info(f"Total URLs discovered: {len(site_map['discovered_urls'])}")
        logger.info(f"Total forms found: {len(site_map['forms'])}")
        
        return site_map
    else:
        logger.error("❌ Site discovery failed!")
        return None

if __name__ == "__main__":
    main()
