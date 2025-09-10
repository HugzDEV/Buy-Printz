#!/usr/bin/env python3
"""
B2Sign Authenticated Analyzer
This script logs into B2Sign and then analyzes the authenticated pages to find quote functionality.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignAuthenticatedAnalyzer:
    def __init__(self):
        self.base_url = 'https://b2sign.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.authenticated = False
    
    def login(self, username, password):
        """Login to B2Sign"""
        try:
            logger.info("🔐 Attempting to login to B2Sign...")
            
            # First, get the login page to get any CSRF tokens or session data
            login_url = 'https://b2sign.com'
            response = self.session.get(login_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the login form
            login_form = None
            forms = soup.find_all('form')
            for form in forms:
                form_text = form.get_text().lower()
                if 'email' in form_text and 'password' in form_text:
                    login_form = form
                    break
            
            if not login_form:
                logger.error("❌ Could not find login form")
                return False
            
            # Prepare login data
            login_data = {}
            
            # Find email and password fields
            inputs = login_form.find_all(['input'])
            for input_elem in inputs:
                field_name = input_elem.get('name', '')
                field_type = input_elem.get('type', '')
                field_placeholder = input_elem.get('placeholder', '').lower()
                
                if field_type == 'email' or 'email' in field_placeholder:
                    login_data[field_name] = username
                elif field_type == 'password' or 'password' in field_placeholder:
                    login_data[field_name] = password
                elif field_type == 'hidden':
                    login_data[field_name] = input_elem.get('value', '')
            
            # If no named fields found, try by placeholder
            if not login_data:
                for input_elem in inputs:
                    placeholder = input_elem.get('placeholder', '').lower()
                    if 'email' in placeholder:
                        login_data['email'] = username
                    elif 'password' in placeholder:
                        login_data['password'] = password
            
            logger.info(f"📝 Login data: {list(login_data.keys())}")
            
            # Submit login form
            form_action = login_form.get('action', '')
            if form_action:
                submit_url = urljoin(login_url, form_action)
            else:
                submit_url = login_url
            
            logger.info(f"🚀 Submitting login to: {submit_url}")
            
            login_response = self.session.post(submit_url, data=login_data, allow_redirects=True)
            
            # Check if login was successful
            if self.check_login_success(login_response):
                self.authenticated = True
                logger.info("✅ Login successful!")
                return True
            else:
                logger.error("❌ Login failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False
    
    def check_login_success(self, response):
        """Check if login was successful"""
        # Check for redirect to dashboard or account page
        if response.status_code in [301, 302]:
            return True
        
        # Check for success indicators in response
        soup = BeautifulSoup(response.content, 'html.parser')
        page_text = soup.get_text().lower()
        
        # Look for success indicators
        success_indicators = ['dashboard', 'account', 'profile', 'logout', 'welcome']
        error_indicators = ['error', 'invalid', 'failed', 'incorrect', 'wrong']
        
        has_success = any(indicator in page_text for indicator in success_indicators)
        has_error = any(indicator in page_text for indicator in error_indicators)
        
        return has_success and not has_error
    
    def analyze_authenticated_pages(self):
        """Analyze pages that are only accessible after login"""
        if not self.authenticated:
            logger.error("❌ Not authenticated. Please login first.")
            return None
        
        logger.info("🔍 Analyzing authenticated pages...")
        
        # Common authenticated pages to check
        authenticated_urls = [
            '/dashboard',
            '/account',
            '/profile',
            '/orders',
            '/quotes',
            '/estimate',
            '/pricing',
            '/quote-request',
            '/custom-quote'
        ]
        
        analysis_results = {
            'authenticated_urls': [],
            'quote_forms': [],
            'product_forms': [],
            'pricing_pages': []
        }
        
        for url_path in authenticated_urls:
            full_url = urljoin(self.base_url, url_path)
            try:
                logger.info(f"📄 Checking: {full_url}")
                response = self.session.get(full_url, timeout=10)
                
                if response.status_code == 200:
                    logger.info(f"✅ Accessible: {full_url}")
                    analysis_results['authenticated_urls'].append(full_url)
                    
                    # Analyze the page
                    page_analysis = self.analyze_page(full_url, response.content)
                    if page_analysis:
                        analysis_results.update(page_analysis)
                
            except Exception as e:
                logger.warning(f"⚠️  Failed to access {full_url}: {e}")
        
        return analysis_results
    
    def analyze_page(self, url, content):
        """Analyze a specific page content"""
        soup = BeautifulSoup(content, 'html.parser')
        
        analysis = {
            'quote_forms': [],
            'product_forms': [],
            'pricing_pages': []
        }
        
        # Find forms
        forms = soup.find_all('form')
        for form in forms:
            form_info = self.analyze_form(form, url)
            if form_info:
                if form_info['type'] == 'quote':
                    analysis['quote_forms'].append(form_info)
                elif form_info['type'] == 'product':
                    analysis['product_forms'].append(form_info)
        
        # Check if this is a pricing page
        page_text = soup.get_text().lower()
        if any(keyword in page_text for keyword in ['price', 'cost', 'quote', 'estimate', 'pricing']):
            analysis['pricing_pages'].append({
                'url': url,
                'title': soup.title.string if soup.title else 'No title',
                'indicators': [keyword for keyword in ['price', 'cost', 'quote', 'estimate', 'pricing'] if keyword in page_text]
            })
        
        return analysis
    
    def analyze_form(self, form, page_url):
        """Analyze a form to determine its type"""
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
                'placeholder': input_elem.get('placeholder', ''),
                'required': input_elem.has_attr('required')
            }
            form_info['fields'].append(field_info)
        
        # Determine form type based on fields and context
        field_names = [field['name'].lower() for field in form_info['fields']]
        field_placeholders = [field['placeholder'].lower() for field in form_info['fields']]
        
        # Check for quote form indicators
        quote_indicators = ['width', 'height', 'quantity', 'size', 'material', 'finish', 'grommet']
        if any(indicator in field_names or indicator in field_placeholders for indicator in quote_indicators):
            form_info['type'] = 'quote'
        
        # Check for product form indicators
        product_indicators = ['product', 'item', 'category', 'type']
        if any(indicator in field_names or indicator in field_placeholders for indicator in product_indicators):
            form_info['type'] = 'product'
        
        return form_info if form_info['type'] != 'unknown' else None
    
    def save_results(self, results):
        """Save analysis results"""
        filename = 'b2sign_authenticated_analysis.json'
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"💾 Authenticated analysis saved to: {filename}")
        
        # Print summary
        logger.info(f"\n📋 AUTHENTICATED ANALYSIS SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Authenticated URLs: {len(results.get('authenticated_urls', []))}")
        logger.info(f"Quote forms: {len(results.get('quote_forms', []))}")
        logger.info(f"Product forms: {len(results.get('product_forms', []))}")
        logger.info(f"Pricing pages: {len(results.get('pricing_pages', []))}")
        
        if results.get('quote_forms'):
            logger.info(f"\n💰 QUOTE FORMS FOUND:")
            for form in results['quote_forms']:
                logger.info(f"  - {form['action_url']}")
                for field in form['fields']:
                    logger.info(f"    - {field['name']} ({field['type']}) - {field['placeholder']}")

def main():
    """Run the authenticated B2Sign analysis"""
    logger.info("🚀 Starting B2Sign authenticated analysis...")
    
    analyzer = B2SignAuthenticatedAnalyzer()
    
    # Login
    username = 'order@buyprintz.com'
    password = '$AG@BuyPr!n1z'
    
    if analyzer.login(username, password):
        # Analyze authenticated pages
        results = analyzer.analyze_authenticated_pages()
        
        if results:
            analyzer.save_results(results)
            logger.info("✅ Authenticated analysis completed successfully!")
            return results
        else:
            logger.error("❌ No authenticated pages found")
            return None
    else:
        logger.error("❌ Login failed, cannot proceed with authenticated analysis")
        return None

if __name__ == "__main__":
    main()
