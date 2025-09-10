#!/usr/bin/env python3
"""
B2Sign Selenium Mapper
This script uses Selenium to handle the React/Inertia.js application and map the actual quote process.
"""

import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignSeleniumMapper:
    def __init__(self, headless=True):
        self.base_url = 'https://b2sign.com'
        self.driver = self.setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 15)
        self.authenticated = False
    
    def setup_driver(self, headless=True):
        """Setup Chrome driver"""
        options = Options()
        if headless:
            options.add_argument('--headless')
        
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        try:
            driver = webdriver.Chrome(options=options)
            logger.info("✅ Chrome driver initialized successfully")
            return driver
        except Exception as e:
            logger.error(f"❌ Failed to initialize Chrome driver: {e}")
            raise
    
    def login(self, username, password):
        """Login to B2Sign using Selenium"""
        try:
            logger.info("🔐 Attempting to login to B2Sign...")
            
            # Navigate to homepage
            self.driver.get(self.base_url)
            time.sleep(3)  # Wait for React to load
            
            # Look for login form elements
            login_selectors = [
                'input[placeholder*="Email"]',
                'input[placeholder*="email"]',
                'input[type="email"]',
                'input[name*="email"]',
                'input[id*="email"]'
            ]
            
            email_field = None
            for selector in login_selectors:
                try:
                    email_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                    logger.info(f"✅ Found email field with selector: {selector}")
                    break
                except TimeoutException:
                    continue
            
            if not email_field:
                logger.error("❌ Could not find email field")
                return False
            
            # Find password field
            password_selectors = [
                'input[type="password"]',
                'input[placeholder*="Password"]',
                'input[placeholder*="password"]',
                'input[name*="password"]',
                'input[id*="password"]'
            ]
            
            password_field = None
            for selector in password_selectors:
                try:
                    password_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                    logger.info(f"✅ Found password field with selector: {selector}")
                    break
                except NoSuchElementException:
                    continue
            
            if not password_field:
                logger.error("❌ Could not find password field")
                return False
            
            # Fill login form
            email_field.clear()
            email_field.send_keys(username)
            time.sleep(1)
            
            password_field.clear()
            password_field.send_keys(password)
            time.sleep(1)
            
            # Find and click submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Login")',
                'button:contains("Sign In")',
                'button:contains("Log In")'
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    logger.info(f"✅ Found submit button with selector: {selector}")
                    break
                except NoSuchElementException:
                    continue
            
            if not submit_button:
                # Try pressing Enter on password field
                password_field.send_keys('\n')
                logger.info("📝 Pressed Enter on password field")
            else:
                submit_button.click()
                logger.info("📝 Clicked submit button")
            
            # Wait for login to complete
            time.sleep(5)
            
            # Check if login was successful
            if self.check_login_success():
                self.authenticated = True
                logger.info("✅ Login successful!")
                return True
            else:
                logger.error("❌ Login failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False
    
    def check_login_success(self):
        """Check if login was successful"""
        try:
            # Check for success indicators
            success_indicators = [
                'dashboard', 'account', 'profile', 'logout', 'welcome',
                'my account', 'user menu', 'sign out'
            ]
            
            page_text = self.driver.page_source.lower()
            
            for indicator in success_indicators:
                if indicator in page_text:
                    logger.info(f"✅ Found success indicator: {indicator}")
                    return True
            
            # Check if we're still on login page
            if 'login' in self.driver.current_url.lower():
                return False
            
            # Check for error messages
            error_indicators = ['error', 'invalid', 'failed', 'incorrect', 'wrong']
            for indicator in error_indicators:
                if indicator in page_text:
                    logger.warning(f"⚠️  Found error indicator: {indicator}")
                    return False
            
            # If we're not on login page and no errors, assume success
            return True
            
        except Exception as e:
            logger.error(f"❌ Error checking login success: {e}")
            return False
    
    def discover_quote_functionality(self):
        """Discover quote functionality after login"""
        if not self.authenticated:
            logger.error("❌ Not authenticated. Please login first.")
            return None
        
        logger.info("🔍 Discovering quote functionality...")
        
        discovery_results = {
            'authenticated_pages': [],
            'quote_forms': [],
            'product_pages': [],
            'pricing_elements': []
        }
        
        # Look for navigation links that might lead to quote functionality
        try:
            # Find all links on the page
            links = self.driver.find_elements(By.TAG_NAME, 'a')
            
            quote_keywords = ['quote', 'estimate', 'pricing', 'cost', 'price', 'order', 'custom']
            
            for link in links:
                try:
                    link_text = link.text.lower()
                    link_href = link.get_attribute('href')
                    
                    if any(keyword in link_text for keyword in quote_keywords):
                        logger.info(f"🔗 Found potential quote link: {link_text} -> {link_href}")
                        discovery_results['authenticated_pages'].append({
                            'text': link_text,
                            'url': link_href
                        })
                        
                        # Click the link to explore
                        try:
                            link.click()
                            time.sleep(3)
                            
                            # Analyze the page
                            page_analysis = self.analyze_current_page()
                            if page_analysis:
                                discovery_results.update(page_analysis)
                            
                            # Go back
                            self.driver.back()
                            time.sleep(2)
                            
                        except Exception as e:
                            logger.warning(f"⚠️  Could not explore link {link_text}: {e}")
                
                except Exception as e:
                    continue
        
        except Exception as e:
            logger.error(f"❌ Error discovering quote functionality: {e}")
        
        return discovery_results
    
    def analyze_current_page(self):
        """Analyze the current page for forms and quote functionality"""
        try:
            analysis = {
                'quote_forms': [],
                'product_pages': [],
                'pricing_elements': []
            }
            
            # Find forms
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            for form in forms:
                form_info = self.analyze_form(form)
                if form_info and form_info['type'] == 'quote':
                    analysis['quote_forms'].append(form_info)
            
            # Look for product-related elements
            page_text = self.driver.page_source.lower()
            product_keywords = ['width', 'height', 'quantity', 'size', 'material', 'finish']
            
            if any(keyword in page_text for keyword in product_keywords):
                analysis['product_pages'].append({
                    'url': self.driver.current_url,
                    'title': self.driver.title,
                    'indicators': [keyword for keyword in product_keywords if keyword in page_text]
                })
            
            # Look for pricing elements
            pricing_keywords = ['price', 'cost', 'total', 'quote', 'estimate']
            if any(keyword in page_text for keyword in pricing_keywords):
                analysis['pricing_elements'].append({
                    'url': self.driver.current_url,
                    'title': self.driver.title,
                    'indicators': [keyword for keyword in pricing_keywords if keyword in page_text]
                })
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Error analyzing current page: {e}")
            return None
    
    def analyze_form(self, form_element):
        """Analyze a form element"""
        try:
            form_info = {
                'action': form_element.get_attribute('action') or '',
                'method': form_element.get_attribute('method') or 'GET',
                'fields': [],
                'type': 'unknown'
            }
            
            # Find form fields
            inputs = form_element.find_elements(By.CSS_SELECTOR, 'input, select, textarea')
            for input_elem in inputs:
                field_info = {
                    'name': input_elem.get_attribute('name') or '',
                    'type': input_elem.get_attribute('type') or 'text',
                    'placeholder': input_elem.get_attribute('placeholder') or '',
                    'id': input_elem.get_attribute('id') or ''
                }
                form_info['fields'].append(field_info)
            
            # Determine form type
            field_names = [field['name'].lower() for field in form_info['fields']]
            field_placeholders = [field['placeholder'].lower() for field in form_info['fields']]
            
            # Check for quote form indicators
            quote_indicators = ['width', 'height', 'quantity', 'size', 'material', 'finish']
            if any(indicator in field_names or indicator in field_placeholders for indicator in quote_indicators):
                form_info['type'] = 'quote'
                logger.info(f"💰 Found quote form with fields: {[f['name'] for f in form_info['fields']]}")
            
            return form_info if form_info['type'] != 'unknown' else None
            
        except Exception as e:
            logger.error(f"❌ Error analyzing form: {e}")
            return None
    
    def save_results(self, results):
        """Save discovery results"""
        filename = 'b2sign_selenium_discovery.json'
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"💾 Selenium discovery results saved to: {filename}")
        
        # Print summary
        logger.info(f"\n📋 SELENIUM DISCOVERY SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Authenticated pages: {len(results.get('authenticated_pages', []))}")
        logger.info(f"Quote forms: {len(results.get('quote_forms', []))}")
        logger.info(f"Product pages: {len(results.get('product_pages', []))}")
        logger.info(f"Pricing elements: {len(results.get('pricing_elements', []))}")
        
        if results.get('quote_forms'):
            logger.info(f"\n💰 QUOTE FORMS FOUND:")
            for form in results['quote_forms']:
                logger.info(f"  - Action: {form['action']}")
                logger.info(f"    Method: {form['method']}")
                for field in form['fields']:
                    logger.info(f"    - {field['name']} ({field['type']}) - {field['placeholder']}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Browser closed")

def main():
    """Run the B2Sign Selenium mapping"""
    logger.info("🚀 Starting B2Sign Selenium mapping...")
    
    mapper = B2SignSeleniumMapper(headless=False)  # Set to False to see what's happening
    
    try:
        # Login
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        if mapper.login(username, password):
            # Discover quote functionality
            results = mapper.discover_quote_functionality()
            
            if results:
                mapper.save_results(results)
                logger.info("✅ Selenium mapping completed successfully!")
                return results
            else:
                logger.error("❌ No quote functionality found")
                return None
        else:
            logger.error("❌ Login failed, cannot proceed with mapping")
            return None
    
    finally:
        mapper.close()

if __name__ == "__main__":
    main()
