#!/usr/bin/env python3
"""
B2Sign Product Page Quote Mapper
This script maps the instant quote systems on B2Sign product pages for banners and tents.
"""

import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementNotInteractableException

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignProductQuoteMapper:
    def __init__(self, headless=False):
        self.base_url = 'https://b2sign.com'
        self.driver = self.setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 20)
        self.authenticated = False
        
        # Product pages to analyze
        self.product_pages = {
            'banners': 'https://www.b2sign.com/banners',
            'custom_event_tents': 'https://www.b2sign.com/custom-event-tents',
            '13oz_vinyl_banner': 'https://www.b2sign.com/13oz-vinyl-banner',
            'fabric_banner': 'https://www.b2sign.com/fabric-banner-9oz-wrinkle-free',
            'mesh_banner': 'https://www.b2sign.com/mesh-banners'
        }
    
    def setup_driver(self, headless=False):
        """Setup Chrome driver"""
        options = Options()
        if headless:
            options.add_argument('--headless')
        
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-web-security')
        options.add_argument('--disable-features=VizDisplayCompositor')
        options.add_argument('--window-size=1920,1080')
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            driver = webdriver.Chrome(options=options)
            driver.implicitly_wait(10)
            logger.info("✅ Chrome driver initialized successfully")
            return driver
        except Exception as e:
            logger.error(f"❌ Failed to initialize Chrome driver: {e}")
            raise
    
    def login(self, username, password):
        """Login to B2Sign using the proven method"""
        try:
            logger.info("🔐 Logging into B2Sign...")
            
            # Navigate to homepage
            self.driver.get(self.base_url)
            time.sleep(3)
            
            # Wait for React to load
            self.wait.until(EC.presence_of_element_located((By.ID, 'app')))
            time.sleep(2)
            
            # Find and fill email field
            email_field = self.driver.find_element(By.CSS_SELECTOR, 'input[placeholder*="Email Address" i]')
            email_field.clear()
            email_field.send_keys(username)
            
            # Find and fill password field
            password_field = self.driver.find_element(By.CSS_SELECTOR, 'input[name*="password" i]')
            password_field.clear()
            password_field.send_keys(password)
            
            # Find and click "Member Sign In" button
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            for button in buttons:
                if 'member sign in' in button.text.lower() and button.is_displayed() and button.is_enabled():
                    button.click()
                    break
            
            # Wait for login to complete
            time.sleep(5)
            
            # Check if login was successful
            if 'login' not in self.driver.current_url.lower():
                self.authenticated = True
                logger.info("✅ Login successful!")
                return True
            else:
                logger.error("❌ Login failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False
    
    def map_product_page_quotes(self, product_name, product_url):
        """Map the instant quote system on a specific product page"""
        try:
            logger.info(f"🔍 Mapping instant quote system for {product_name}...")
            
            # Navigate to product page
            self.driver.get(product_url)
            time.sleep(5)  # Wait for page to load
            
            # Save screenshot for reference
            screenshot_name = f'b2sign_{product_name.replace(" ", "_")}_quote.png'
            self.driver.save_screenshot(screenshot_name)
            logger.info(f"📸 Screenshot saved: {screenshot_name}")
            
            # Analyze the page for quote systems
            quote_analysis = {
                'product_name': product_name,
                'url': product_url,
                'title': self.driver.title,
                'quote_forms': [],
                'quote_buttons': [],
                'product_options': [],
                'pricing_display': [],
                'instant_quote_elements': []
            }
            
            # Look for instant quote elements
            self.find_instant_quote_elements(quote_analysis)
            
            # Look for quote forms
            self.find_quote_forms(quote_analysis)
            
            # Look for quote buttons
            self.find_quote_buttons(quote_analysis)
            
            # Look for product options (size, material, etc.)
            self.find_product_options(quote_analysis)
            
            # Look for pricing displays
            self.find_pricing_displays(quote_analysis)
            
            return quote_analysis
            
        except Exception as e:
            logger.error(f"❌ Error mapping {product_name} quote system: {e}")
            return None
    
    def find_instant_quote_elements(self, analysis):
        """Find instant quote system elements"""
        try:
            # Look for common instant quote selectors
            quote_selectors = [
                '[class*="quote"]',
                '[class*="instant"]',
                '[class*="pricing"]',
                '[class*="calculator"]',
                '[id*="quote"]',
                '[id*="instant"]',
                '[id*="pricing"]',
                '[id*="calculator"]'
            ]
            
            for selector in quote_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed():
                        element_info = {
                            'selector': selector,
                            'tag': element.tag_name,
                            'text': element.text.strip(),
                            'class': element.get_attribute('class'),
                            'id': element.get_attribute('id')
                        }
                        analysis['instant_quote_elements'].append(element_info)
            
            logger.info(f"🔍 Found {len(analysis['instant_quote_elements'])} instant quote elements")
            
        except Exception as e:
            logger.error(f"❌ Error finding instant quote elements: {e}")
    
    def find_quote_forms(self, analysis):
        """Find quote forms on the page"""
        try:
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            logger.info(f"🔍 Found {len(forms)} forms on {analysis['product_name']} page")
            
            for i, form in enumerate(forms):
                form_info = {
                    'index': i,
                    'action': form.get_attribute('action') or '',
                    'method': form.get_attribute('method') or 'GET',
                    'id': form.get_attribute('id') or '',
                    'class': form.get_attribute('class') or '',
                    'fields': []
                }
                
                # Find form fields
                inputs = form.find_elements(By.CSS_SELECTOR, 'input, select, textarea')
                for input_elem in inputs:
                    field_info = self.analyze_form_field(input_elem)
                    if field_info:
                        form_info['fields'].append(field_info)
                
                # Check if this looks like a quote form
                field_names = [field['name'].lower() for field in form_info['fields'] if field['name']]
                field_placeholders = [field['placeholder'].lower() for field in form_info['fields'] if field['placeholder']]
                
                quote_indicators = ['width', 'height', 'quantity', 'size', 'material', 'finish', 'grommet', 'quote', 'price']
                if any(indicator in field_names or indicator in field_placeholders for indicator in quote_indicators):
                    form_info['type'] = 'quote'
                    analysis['quote_forms'].append(form_info)
                    logger.info(f"💰 Found quote form with {len(form_info['fields'])} fields")
            
        except Exception as e:
            logger.error(f"❌ Error finding quote forms: {e}")
    
    def find_quote_buttons(self, analysis):
        """Find quote-related buttons"""
        try:
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            
            for button in buttons:
                button_text = button.text.lower()
                if any(keyword in button_text for keyword in ['quote', 'instant', 'price', 'calculate', 'get quote', 'add to cart']):
                    if button.is_displayed():
                        button_info = {
                            'text': button.text.strip(),
                            'type': button.get_attribute('type'),
                            'class': button.get_attribute('class'),
                            'id': button.get_attribute('id'),
                            'enabled': button.is_enabled()
                        }
                        analysis['quote_buttons'].append(button_info)
            
            logger.info(f"🔍 Found {len(analysis['quote_buttons'])} quote buttons")
            
        except Exception as e:
            logger.error(f"❌ Error finding quote buttons: {e}")
    
    def find_product_options(self, analysis):
        """Find product option selectors (size, material, etc.)"""
        try:
            # Look for select elements
            selects = self.driver.find_elements(By.TAG_NAME, 'select')
            
            for select in selects:
                if select.is_displayed():
                    select_info = {
                        'name': select.get_attribute('name') or '',
                        'id': select.get_attribute('id') or '',
                        'class': select.get_attribute('class') or '',
                        'options': []
                    }
                    
                    # Get options
                    options = select.find_elements(By.TAG_NAME, 'option')
                    for option in options:
                        option_info = {
                            'value': option.get_attribute('value') or '',
                            'text': option.text.strip(),
                            'selected': option.get_attribute('selected') is not None
                        }
                        select_info['options'].append(option_info)
                    
                    analysis['product_options'].append(select_info)
            
            # Look for input elements that might be product options
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            for input_elem in inputs:
                input_type = input_elem.get_attribute('type') or 'text'
                if input_type in ['radio', 'checkbox'] and input_elem.is_displayed():
                    input_info = {
                        'type': input_type,
                        'name': input_elem.get_attribute('name') or '',
                        'value': input_elem.get_attribute('value') or '',
                        'id': input_elem.get_attribute('id') or '',
                        'checked': input_elem.is_selected()
                    }
                    analysis['product_options'].append(input_info)
            
            logger.info(f"🔍 Found {len(analysis['product_options'])} product options")
            
        except Exception as e:
            logger.error(f"❌ Error finding product options: {e}")
    
    def find_pricing_displays(self, analysis):
        """Find pricing display elements"""
        try:
            # Look for price elements
            price_selectors = [
                '[class*="price"]',
                '[class*="cost"]',
                '[class*="total"]',
                '[id*="price"]',
                '[id*="cost"]',
                '[id*="total"]'
            ]
            
            for selector in price_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed() and element.text.strip():
                        price_info = {
                            'selector': selector,
                            'text': element.text.strip(),
                            'class': element.get_attribute('class'),
                            'id': element.get_attribute('id')
                        }
                        analysis['pricing_display'].append(price_info)
            
            logger.info(f"🔍 Found {len(analysis['pricing_display'])} pricing displays")
            
        except Exception as e:
            logger.error(f"❌ Error finding pricing displays: {e}")
    
    def analyze_form_field(self, field_element):
        """Analyze a form field element"""
        try:
            field_info = {
                'tag': field_element.tag_name,
                'type': field_element.get_attribute('type') or 'text',
                'name': field_element.get_attribute('name') or '',
                'id': field_element.get_attribute('id') or '',
                'class': field_element.get_attribute('class') or '',
                'placeholder': field_element.get_attribute('placeholder') or '',
                'value': field_element.get_attribute('value') or '',
                'visible': field_element.is_displayed(),
                'enabled': field_element.is_enabled()
            }
            
            # For select elements, get options
            if field_element.tag_name == 'select':
                options = field_element.find_elements(By.TAG_NAME, 'option')
                field_info['options'] = []
                for option in options:
                    option_info = {
                        'value': option.get_attribute('value') or '',
                        'text': option.text.strip(),
                        'selected': option.get_attribute('selected') is not None
                    }
                    field_info['options'].append(option_info)
            
            return field_info
            
        except Exception as e:
            logger.error(f"❌ Error analyzing form field: {e}")
            return None
    
    def test_instant_quote(self, product_name, product_url, sample_data):
        """Test the instant quote system with sample data"""
        try:
            logger.info(f"🧪 Testing instant quote for {product_name}...")
            
            # Navigate to product page
            self.driver.get(product_url)
            time.sleep(5)
            
            quote_test = {
                'product_name': product_name,
                'success': False,
                'fields_filled': [],
                'buttons_clicked': [],
                'pricing_result': None,
                'errors': []
            }
            
            # Try to fill form fields
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            for input_elem in inputs:
                try:
                    field_name = input_elem.get_attribute('name') or ''
                    field_placeholder = input_elem.get_attribute('placeholder') or ''
                    field_type = input_elem.get_attribute('type') or 'text'
                    
                    # Map fields to sample data
                    value_to_fill = None
                    if any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['width', 'w']):
                        value_to_fill = str(sample_data.get('width', ''))
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['height', 'h']):
                        value_to_fill = str(sample_data.get('height', ''))
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['quantity', 'qty', 'q']):
                        value_to_fill = str(sample_data.get('quantity', ''))
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['zip', 'postal', 'code']):
                        value_to_fill = str(sample_data.get('zip_code', ''))
                    
                    if value_to_fill and input_elem.is_displayed() and input_elem.is_enabled():
                        input_elem.clear()
                        input_elem.send_keys(value_to_fill)
                        quote_test['fields_filled'].append({
                            'field': field_name or field_placeholder,
                            'value': value_to_fill
                        })
                        logger.info(f"✅ Filled field: {field_name or field_placeholder} = {value_to_fill}")
                
                except Exception as e:
                    quote_test['errors'].append(f"Error filling field: {e}")
            
            # Try to click quote buttons
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            for button in buttons:
                button_text = button.text.lower()
                if any(keyword in button_text for keyword in ['quote', 'instant', 'price', 'calculate', 'get quote']):
                    if button.is_displayed() and button.is_enabled():
                        try:
                            button.click()
                            quote_test['buttons_clicked'].append(button_text)
                            logger.info(f"✅ Clicked button: {button_text}")
                            time.sleep(3)  # Wait for response
                            break
                        except Exception as e:
                            quote_test['errors'].append(f"Error clicking button {button_text}: {e}")
            
            # Look for pricing result
            price_elements = self.driver.find_elements(By.CSS_SELECTOR, '[class*="price"], [class*="cost"], [class*="total"]')
            for element in price_elements:
                if element.is_displayed() and element.text.strip() and '$' in element.text:
                    quote_test['pricing_result'] = element.text.strip()
                    logger.info(f"💰 Found pricing result: {element.text.strip()}")
                    break
            
            quote_test['success'] = len(quote_test['fields_filled']) > 0 or len(quote_test['buttons_clicked']) > 0
            
            return quote_test
            
        except Exception as e:
            logger.error(f"❌ Error testing instant quote: {e}")
            return None
    
    def save_results(self, all_results):
        """Save all analysis results"""
        filename = 'b2sign_product_quote_analysis.json'
        with open(filename, 'w') as f:
            json.dump(all_results, f, indent=2)
        
        logger.info(f"💾 Product quote analysis saved to: {filename}")
        
        # Print summary
        logger.info(f"\n📋 PRODUCT QUOTE ANALYSIS SUMMARY")
        logger.info(f"{'='*60}")
        
        for product_name, analysis in all_results.items():
            if analysis:
                logger.info(f"\n🔍 {product_name.upper()}:")
                logger.info(f"  URL: {analysis['url']}")
                logger.info(f"  Quote forms: {len(analysis['quote_forms'])}")
                logger.info(f"  Quote buttons: {len(analysis['quote_buttons'])}")
                logger.info(f"  Product options: {len(analysis['product_options'])}")
                logger.info(f"  Pricing displays: {len(analysis['pricing_display'])}")
                logger.info(f"  Instant quote elements: {len(analysis['instant_quote_elements'])}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Browser closed")

def main():
    """Run the B2Sign product quote mapping"""
    logger.info("🚀 Starting B2Sign product quote mapping...")
    
    mapper = B2SignProductQuoteMapper(headless=False)  # Set to False to see what's happening
    
    try:
        # Login
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        if mapper.login(username, password):
            # Map all product pages
            all_results = {}
            
            for product_name, product_url in mapper.product_pages.items():
                analysis = mapper.map_product_page_quotes(product_name, product_url)
                all_results[product_name] = analysis
                
                # Test instant quote with sample data
                if analysis:
                    sample_data = {
                        'width': 24,
                        'height': 36,
                        'quantity': 1,
                        'zip_code': '10001'
                    }
                    
                    quote_test = mapper.test_instant_quote(product_name, product_url, sample_data)
                    if quote_test:
                        all_results[f"{product_name}_test"] = quote_test
            
            # Save results
            mapper.save_results(all_results)
            
            logger.info("✅ Product quote mapping completed successfully!")
            return all_results
        else:
            logger.error("❌ Login failed, cannot proceed with product quote mapping")
            return None
    
    finally:
        mapper.close()

if __name__ == "__main__":
    main()
