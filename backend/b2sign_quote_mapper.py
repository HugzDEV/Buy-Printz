#!/usr/bin/env python3
"""
B2Sign Quote Form Mapper
This script logs into B2Sign and maps the quote form structure to understand how to generate quotes.
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

class B2SignQuoteMapper:
    def __init__(self, headless=False):
        self.base_url = 'https://b2sign.com'
        self.driver = self.setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 20)
        self.authenticated = False
    
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
    
    def map_quote_form(self):
        """Map the quote form structure on the estimate page"""
        if not self.authenticated:
            logger.error("❌ Not authenticated. Please login first.")
            return None
        
        try:
            logger.info("🔍 Mapping quote form structure...")
            
            # Navigate to estimate page
            estimate_url = 'https://b2sign.com/estimate'
            self.driver.get(estimate_url)
            time.sleep(5)  # Wait for page to load
            
            # Save screenshot for reference
            self.driver.save_screenshot('b2sign_estimate_form.png')
            logger.info("📸 Screenshot saved: b2sign_estimate_form.png")
            
            # Analyze the page structure
            quote_analysis = {
                'url': estimate_url,
                'title': self.driver.title,
                'forms': [],
                'input_fields': [],
                'select_fields': [],
                'product_options': [],
                'pricing_elements': [],
                'page_structure': {}
            }
            
            # Find all forms
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            logger.info(f"🔍 Found {len(forms)} forms on estimate page")
            
            for i, form in enumerate(forms):
                form_info = self.analyze_form(form, i)
                if form_info:
                    quote_analysis['forms'].append(form_info)
            
            # Find all input elements
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            logger.info(f"🔍 Found {len(inputs)} input elements")
            
            for input_elem in inputs:
                input_info = self.analyze_input(input_elem)
                if input_info:
                    quote_analysis['input_fields'].append(input_info)
            
            # Find all select elements
            selects = self.driver.find_elements(By.TAG_NAME, 'select')
            logger.info(f"🔍 Found {len(selects)} select elements")
            
            for select_elem in selects:
                select_info = self.analyze_select(select_elem)
                if select_info:
                    quote_analysis['select_fields'].append(select_info)
            
            # Look for product-related elements
            self.find_product_elements(quote_analysis)
            
            # Look for pricing elements
            self.find_pricing_elements(quote_analysis)
            
            # Analyze page structure
            self.analyze_page_structure(quote_analysis)
            
            return quote_analysis
            
        except Exception as e:
            logger.error(f"❌ Error mapping quote form: {e}")
            return None
    
    def analyze_form(self, form_element, index):
        """Analyze a form element"""
        try:
            form_info = {
                'index': index,
                'action': form_element.get_attribute('action') or '',
                'method': form_element.get_attribute('method') or 'GET',
                'id': form_element.get_attribute('id') or '',
                'class': form_element.get_attribute('class') or '',
                'fields': [],
                'type': 'unknown'
            }
            
            # Find form fields
            inputs = form_element.find_elements(By.CSS_SELECTOR, 'input, select, textarea')
            for input_elem in inputs:
                field_info = self.analyze_input(input_elem)
                if field_info:
                    form_info['fields'].append(field_info)
            
            # Determine form type based on fields
            field_names = [field['name'].lower() for field in form_info['fields'] if field['name']]
            field_placeholders = [field['placeholder'].lower() for field in form_info['fields'] if field['placeholder']]
            
            # Check for quote form indicators
            quote_indicators = ['width', 'height', 'quantity', 'size', 'material', 'finish', 'grommet', 'quote', 'estimate']
            if any(indicator in field_names or indicator in field_placeholders for indicator in quote_indicators):
                form_info['type'] = 'quote'
                logger.info(f"💰 Found quote form with {len(form_info['fields'])} fields")
            
            return form_info
            
        except Exception as e:
            logger.error(f"❌ Error analyzing form: {e}")
            return None
    
    def analyze_input(self, input_elem):
        """Analyze an input element"""
        try:
            input_info = {
                'tag': input_elem.tag_name,
                'type': input_elem.get_attribute('type') or 'text',
                'name': input_elem.get_attribute('name') or '',
                'id': input_elem.get_attribute('id') or '',
                'class': input_elem.get_attribute('class') or '',
                'placeholder': input_elem.get_attribute('placeholder') or '',
                'value': input_elem.get_attribute('value') or '',
                'required': input_elem.get_attribute('required') is not None,
                'visible': input_elem.is_displayed(),
                'enabled': input_elem.is_enabled()
            }
            
            # Only include relevant fields
            if input_info['name'] or input_info['placeholder'] or input_info['type'] in ['text', 'number', 'email', 'tel']:
                return input_info
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error analyzing input: {e}")
            return None
    
    def analyze_select(self, select_elem):
        """Analyze a select element"""
        try:
            select_info = {
                'tag': select_elem.tag_name,
                'name': select_elem.get_attribute('name') or '',
                'id': select_elem.get_attribute('id') or '',
                'class': select_elem.get_attribute('class') or '',
                'required': select_elem.has_attr('required'),
                'visible': select_elem.is_displayed(),
                'enabled': select_elem.is_enabled(),
                'options': []
            }
            
            # Get options
            options = select_elem.find_elements(By.TAG_NAME, 'option')
            for option in options:
                option_info = {
                    'value': option.get_attribute('value') or '',
                    'text': option.text.strip(),
                    'selected': option.has_attr('selected')
                }
                select_info['options'].append(option_info)
            
            return select_info
            
        except Exception as e:
            logger.error(f"❌ Error analyzing select: {e}")
            return None
    
    def find_product_elements(self, analysis):
        """Find product-related elements on the page"""
        try:
            # Look for product categories, materials, sizes, etc.
            product_keywords = [
                'banner', 'vinyl', 'fabric', 'material', 'size', 'dimension',
                'width', 'height', 'quantity', 'finish', 'grommet', 'hemming',
                'product', 'type', 'category', 'option'
            ]
            
            page_text = self.driver.page_source.lower()
            
            for keyword in product_keywords:
                if keyword in page_text:
                    analysis['product_options'].append({
                        'keyword': keyword,
                        'context': self.extract_context_around_keyword(keyword, page_text)
                    })
            
        except Exception as e:
            logger.error(f"❌ Error finding product elements: {e}")
    
    def find_pricing_elements(self, analysis):
        """Find pricing-related elements on the page"""
        try:
            # Look for price displays, cost calculations, etc.
            price_patterns = [
                r'\$[\d,]+\.?\d*',
                'price', 'cost', 'total', 'quote', 'estimate', 'pricing'
            ]
            
            page_text = self.driver.page_source.lower()
            
            for pattern in price_patterns:
                if pattern in page_text:
                    analysis['pricing_elements'].append({
                        'pattern': pattern,
                        'context': self.extract_context_around_keyword(pattern, page_text)
                    })
            
        except Exception as e:
            logger.error(f"❌ Error finding pricing elements: {e}")
    
    def extract_context_around_keyword(self, keyword, text, context_length=100):
        """Extract context around a keyword"""
        try:
            index = text.find(keyword)
            if index != -1:
                start = max(0, index - context_length)
                end = min(len(text), index + len(keyword) + context_length)
                return text[start:end].strip()
            return ""
        except:
            return ""
    
    def analyze_page_structure(self, analysis):
        """Analyze the overall page structure"""
        try:
            # Get page sections
            sections = self.driver.find_elements(By.CSS_SELECTOR, 'section, div[class*="section"], div[class*="form"], div[class*="quote"]')
            
            analysis['page_structure'] = {
                'sections': len(sections),
                'has_sidebar': len(self.driver.find_elements(By.CSS_SELECTOR, '[class*="sidebar"], [class*="side"]')) > 0,
                'has_navigation': len(self.driver.find_elements(By.CSS_SELECTOR, 'nav, [class*="nav"]')) > 0,
                'has_footer': len(self.driver.find_elements(By.CSS_SELECTOR, 'footer, [class*="footer"]')) > 0
            }
            
        except Exception as e:
            logger.error(f"❌ Error analyzing page structure: {e}")
    
    def test_quote_generation(self, sample_product):
        """Test generating a quote with sample product data"""
        if not self.authenticated:
            logger.error("❌ Not authenticated. Please login first.")
            return None
        
        try:
            logger.info("🧪 Testing quote generation with sample product...")
            
            # Navigate to estimate page
            self.driver.get('https://b2sign.com/estimate')
            time.sleep(3)
            
            # Try to fill out the form with sample data
            quote_result = {
                'success': False,
                'fields_filled': [],
                'errors': [],
                'final_url': '',
                'page_content': ''
            }
            
            # Sample product data
            sample_data = {
                'width': '24',
                'height': '36',
                'quantity': '1',
                'material': 'vinyl',
                'zip_code': '10001'
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
                        value_to_fill = sample_data['width']
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['height', 'h']):
                        value_to_fill = sample_data['height']
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['quantity', 'qty', 'q']):
                        value_to_fill = sample_data['quantity']
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['zip', 'postal', 'code']):
                        value_to_fill = sample_data['zip_code']
                    
                    if value_to_fill and input_elem.is_displayed() and input_elem.is_enabled():
                        input_elem.clear()
                        input_elem.send_keys(value_to_fill)
                        quote_result['fields_filled'].append({
                            'field': field_name or field_placeholder,
                            'value': value_to_fill
                        })
                        logger.info(f"✅ Filled field: {field_name or field_placeholder} = {value_to_fill}")
                
                except Exception as e:
                    quote_result['errors'].append(f"Error filling field: {e}")
            
            # Try to submit the form
            try:
                submit_buttons = self.driver.find_elements(By.CSS_SELECTOR, 'button[type="submit"], input[type="submit"], button')
                for button in submit_buttons:
                    button_text = button.text.lower()
                    if any(keyword in button_text for keyword in ['submit', 'quote', 'estimate', 'calculate', 'get quote']):
                        if button.is_displayed() and button.is_enabled():
                            button.click()
                            logger.info("✅ Clicked submit button")
                            break
                
                # Wait for response
                time.sleep(5)
                
                quote_result['final_url'] = self.driver.current_url
                quote_result['page_content'] = self.driver.page_source[:1000]  # First 1000 chars
                quote_result['success'] = True
                
            except Exception as e:
                quote_result['errors'].append(f"Error submitting form: {e}")
            
            return quote_result
            
        except Exception as e:
            logger.error(f"❌ Error testing quote generation: {e}")
            return None
    
    def save_results(self, analysis):
        """Save analysis results"""
        filename = 'b2sign_quote_analysis.json'
        with open(filename, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        logger.info(f"💾 Quote analysis saved to: {filename}")
        
        # Print summary
        logger.info(f"\n📋 QUOTE FORM ANALYSIS SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"URL: {analysis['url']}")
        logger.info(f"Title: {analysis['title']}")
        logger.info(f"Forms: {len(analysis['forms'])}")
        logger.info(f"Input fields: {len(analysis['input_fields'])}")
        logger.info(f"Select fields: {len(analysis['select_fields'])}")
        logger.info(f"Product options: {len(analysis['product_options'])}")
        logger.info(f"Pricing elements: {len(analysis['pricing_elements'])}")
        
        if analysis['forms']:
            logger.info(f"\n💰 QUOTE FORMS:")
            for form in analysis['forms']:
                if form['type'] == 'quote':
                    logger.info(f"  - Form {form['index']}: {form['method']} -> {form['action']}")
                    logger.info(f"    Fields: {len(form['fields'])}")
                    for field in form['fields']:
                        logger.info(f"      - {field['name']} ({field['type']}) - {field['placeholder']}")
        
        if analysis['input_fields']:
            logger.info(f"\n📝 INPUT FIELDS:")
            for field in analysis['input_fields']:
                if field['name'] or field['placeholder']:
                    logger.info(f"  - {field['name']} ({field['type']}) - {field['placeholder']}")
        
        if analysis['select_fields']:
            logger.info(f"\n📋 SELECT FIELDS:")
            for field in analysis['select_fields']:
                logger.info(f"  - {field['name']} - {len(field['options'])} options")
                for option in field['options'][:3]:  # Show first 3 options
                    logger.info(f"    - {option['value']}: {option['text']}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Browser closed")

def main():
    """Run the B2Sign quote form mapping"""
    logger.info("🚀 Starting B2Sign quote form mapping...")
    
    mapper = B2SignQuoteMapper(headless=False)  # Set to False to see what's happening
    
    try:
        # Login
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        if mapper.login(username, password):
            # Map quote form
            analysis = mapper.map_quote_form()
            
            if analysis:
                mapper.save_results(analysis)
                
                # Test quote generation
                sample_product = {
                    'width': 24,
                    'height': 36,
                    'quantity': 1,
                    'material': 'vinyl',
                    'zip_code': '10001'
                }
                
                quote_test = mapper.test_quote_generation(sample_product)
                if quote_test:
                    logger.info(f"\n🧪 QUOTE GENERATION TEST:")
                    logger.info(f"Success: {quote_test['success']}")
                    logger.info(f"Fields filled: {len(quote_test['fields_filled'])}")
                    logger.info(f"Errors: {len(quote_test['errors'])}")
                    
                    # Save quote test results
                    with open('b2sign_quote_test.json', 'w') as f:
                        json.dump(quote_test, f, indent=2)
                
                logger.info("✅ Quote form mapping completed successfully!")
                return analysis
            else:
                logger.error("❌ Quote form mapping failed")
                return None
        else:
            logger.error("❌ Login failed, cannot proceed with quote mapping")
            return None
    
    finally:
        mapper.close()

if __name__ == "__main__":
    main()
