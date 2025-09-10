#!/usr/bin/env python3
"""
B2Sign Order Mockup System
This script creates actual order mockups on B2Sign product pages to generate shipping costs.
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
from typing import Dict, List, Optional, Any

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignOrderMockup:
    def __init__(self, headless=True):
        self.base_url = 'https://b2sign.com'
        self.driver = self.setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 20)
        self.authenticated = False
        
        # Product page mappings
        self.product_pages = {
            'banner_13oz_vinyl': 'https://www.b2sign.com/13oz-vinyl-banner',
            'banner_fabric_9oz': 'https://www.b2sign.com/fabric-banner-9oz-wrinkle-free',
            'banner_mesh': 'https://www.b2sign.com/mesh-banners',
            'banner_backlit': 'https://www.b2sign.com/vinyl-banner-backlit',
            'banner_blockout': 'https://www.b2sign.com/vinyl-banner-18oz-blockout',
            'banner_indoor': 'https://www.b2sign.com/super-smooth-indoor-banner',
            'banner_pole': 'https://www.b2sign.com/pole-banner-set',
            'banner_hand': 'https://www.b2sign.com/hand-banner',
            'tent_10x10': 'https://www.b2sign.com/custom-event-tents',
            'tent_10x15': 'https://www.b2sign.com/custom-event-tents',
            'tent_10x20': 'https://www.b2sign.com/custom-event-tents'
        }
    
    def setup_driver(self, headless=True):
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
    
    def login(self, username: str, password: str) -> bool:
        """Login to B2Sign"""
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
    
    def map_buyprintz_to_b2sign_product(self, product_details: Dict[str, Any]) -> str:
        """Map BuyPrintz product details to B2Sign product page"""
        product_type = product_details.get('product_type', '').lower()
        material = product_details.get('material', '').lower()
        
        # Map product types to B2Sign product pages
        if product_type == 'banner':
            if 'vinyl' in material or '13oz' in material:
                return 'banner_13oz_vinyl'
            elif 'fabric' in material or '9oz' in material:
                return 'banner_fabric_9oz'
            elif 'mesh' in material:
                return 'banner_mesh'
            elif 'backlit' in material:
                return 'banner_backlit'
            elif 'blockout' in material or '18oz' in material:
                return 'banner_blockout'
            elif 'indoor' in material:
                return 'banner_indoor'
            elif 'pole' in material:
                return 'banner_pole'
            elif 'hand' in material:
                return 'banner_hand'
            else:
                return 'banner_13oz_vinyl'  # Default to vinyl banner
        
        elif product_type == 'tent':
            # Map tent sizes
            width = product_details.get('width', 0)
            height = product_details.get('height', 0)
            
            if width == 10 and height == 10:
                return 'tent_10x10'
            elif width == 10 and height == 15:
                return 'tent_10x15'
            elif width == 10 and height == 20:
                return 'tent_10x20'
            else:
                return 'tent_10x10'  # Default to 10x10 tent
        
        else:
            return 'banner_13oz_vinyl'  # Default fallback
    
    def create_order_mockup(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """Create an order mockup on B2Sign and extract shipping costs"""
        if not self.authenticated:
            logger.error("❌ Not authenticated. Please login first.")
            return {'error': 'Not authenticated'}
        
        try:
            logger.info("🛒 Creating order mockup on B2Sign...")
            
            # Map to B2Sign product
            b2sign_product = self.map_buyprintz_to_b2sign_product(product_details)
            product_url = self.product_pages.get(b2sign_product)
            
            if not product_url:
                return {'error': f'No B2Sign product page found for {b2sign_product}'}
            
            logger.info(f"🎯 Using B2Sign product: {b2sign_product} -> {product_url}")
            
            # Navigate to product page
            self.driver.get(product_url)
            time.sleep(5)  # Wait for page to load
            
            # Create order mockup
            order_result = {
                'product_type': product_details.get('product_type'),
                'b2sign_product': b2sign_product,
                'product_url': product_url,
                'success': False,
                'order_details': {},
                'shipping_costs': {},
                'total_costs': {},
                'errors': []
            }
            
            # Fill out the order form
            self.fill_order_form(product_details, order_result)
            
            # Add to cart and get pricing
            self.add_to_cart_and_get_pricing(order_result)
            
            # Extract shipping costs
            self.extract_shipping_costs(order_result)
            
            # Save screenshot for debugging
            screenshot_name = f'b2sign_order_mockup_{b2sign_product}_{int(time.time())}.png'
            self.driver.save_screenshot(screenshot_name)
            logger.info(f"📸 Order mockup screenshot saved: {screenshot_name}")
            
            return order_result
            
        except Exception as e:
            logger.error(f"❌ Error creating order mockup: {e}")
            return {'error': str(e)}
    
    def fill_order_form(self, product_details: Dict[str, Any], order_result: Dict[str, Any]):
        """Fill out the order form with product details"""
        try:
            logger.info("📝 Filling order form...")
            
            # Extract product details
            width = product_details.get('width', 24)
            height = product_details.get('height', 36)
            quantity = product_details.get('quantity', 1)
            zip_code = product_details.get('zip_code', '10001')
            job_name = product_details.get('job_name', f'BuyPrintz Quote {int(time.time())}')
            
            # Find and fill form fields
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            selects = self.driver.find_elements(By.TAG_NAME, 'select')
            
            fields_filled = []
            
            # Fill input fields
            for input_elem in inputs:
                try:
                    field_name = input_elem.get_attribute('name') or ''
                    field_placeholder = input_elem.get_attribute('placeholder') or ''
                    field_type = input_elem.get_attribute('type') or 'text'
                    
                    # Map fields to product details
                    value_to_fill = None
                    field_mapped = None
                    
                    if any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['width', 'w']):
                        value_to_fill = str(width)
                        field_mapped = 'width'
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['height', 'h']):
                        value_to_fill = str(height)
                        field_mapped = 'height'
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['quantity', 'qty', 'q']):
                        value_to_fill = str(quantity)
                        field_mapped = 'quantity'
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['zip', 'postal', 'code']):
                        value_to_fill = str(zip_code)
                        field_mapped = 'zip_code'
                    elif any(keyword in field_name.lower() or keyword in field_placeholder.lower() for keyword in ['job', 'po', 'name']):
                        value_to_fill = job_name
                        field_mapped = 'job_name'
                    
                    if value_to_fill and input_elem.is_displayed() and input_elem.is_enabled():
                        input_elem.clear()
                        input_elem.send_keys(value_to_fill)
                        fields_filled.append({
                            'field': field_name or field_placeholder,
                            'value': value_to_fill,
                            'mapped_to': field_mapped
                        })
                        logger.info(f"✅ Filled field: {field_name or field_placeholder} = {value_to_fill}")
                
                except Exception as e:
                    order_result['errors'].append(f"Error filling input field: {e}")
            
            # Fill select fields
            for select_elem in selects:
                try:
                    select_name = select_elem.get_attribute('name') or ''
                    select_id = select_elem.get_attribute('id') or ''
                    
                    # Look for material, finish, or other product options
                    if any(keyword in select_name.lower() or keyword in select_id.lower() for keyword in ['material', 'finish', 'grommet', 'hemming']):
                        # Try to select appropriate option based on product details
                        options = select_elem.find_elements(By.TAG_NAME, 'option')
                        for option in options:
                            option_text = option.text.lower()
                            option_value = option.get_attribute('value')
                            
                            # Map product details to select options
                            if self.should_select_option(option_text, option_value, product_details):
                                select = Select(select_elem)
                                select.select_by_value(option_value)
                                fields_filled.append({
                                    'field': select_name or select_id,
                                    'value': option_text,
                                    'mapped_to': 'product_option'
                                })
                                logger.info(f"✅ Selected option: {select_name or select_id} = {option_text}")
                                break
                
                except Exception as e:
                    order_result['errors'].append(f"Error filling select field: {e}")
            
            order_result['order_details']['fields_filled'] = fields_filled
            logger.info(f"📝 Filled {len(fields_filled)} form fields")
            
        except Exception as e:
            logger.error(f"❌ Error filling order form: {e}")
            order_result['errors'].append(f"Error filling order form: {e}")
    
    def should_select_option(self, option_text: str, option_value: str, product_details: Dict[str, Any]) -> bool:
        """Determine if a select option should be selected based on product details"""
        material = product_details.get('material', '').lower()
        finish = product_details.get('finish', '').lower()
        
        # Map product details to select options
        if 'vinyl' in material and 'vinyl' in option_text:
            return True
        elif 'fabric' in material and 'fabric' in option_text:
            return True
        elif 'mesh' in material and 'mesh' in option_text:
            return True
        elif 'grommet' in finish and 'grommet' in option_text:
            return True
        elif 'hemming' in finish and 'hemming' in option_text:
            return True
        
        return False
    
    def add_to_cart_and_get_pricing(self, order_result: Dict[str, Any]):
        """Add item to cart and get pricing information"""
        try:
            logger.info("🛒 Adding to cart and getting pricing...")
            
            # Find and click "Add to Cart" button
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            add_to_cart_clicked = False
            
            for button in buttons:
                button_text = button.text.lower()
                if any(keyword in button_text for keyword in ['add to cart', 'add to quote', 'get quote', 'calculate']):
                    if button.is_displayed() and button.is_enabled():
                        try:
                            # Scroll to button and click
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", button)
                            time.sleep(2)
                            
                            # Try multiple click methods
                            try:
                                button.click()
                                add_to_cart_clicked = True
                                logger.info(f"✅ Clicked button: {button_text}")
                                break
                            except ElementNotInteractableException:
                                # Try JavaScript click
                                self.driver.execute_script("arguments[0].click();", button)
                                add_to_cart_clicked = True
                                logger.info(f"✅ Clicked button via JavaScript: {button_text}")
                                break
                            except Exception as e:
                                logger.warning(f"⚠️  Error clicking button {button_text}: {e}")
                                
                        except Exception as e:
                            logger.warning(f"⚠️  Error with button {button_text}: {e}")
            
            if not add_to_cart_clicked:
                order_result['errors'].append("Could not find or click Add to Cart button")
                return
            
            # Wait for pricing to update
            time.sleep(5)
            
            # Look for pricing information
            self.extract_pricing_information(order_result)
            
        except Exception as e:
            logger.error(f"❌ Error adding to cart: {e}")
            order_result['errors'].append(f"Error adding to cart: {e}")
    
    def extract_pricing_information(self, order_result: Dict[str, Any]):
        """Extract pricing information from the page"""
        try:
            logger.info("💰 Extracting pricing information...")
            
            pricing_info = {
                'product_price': None,
                'shipping_price': None,
                'tax': None,
                'total_price': None,
                'price_elements': []
            }
            
            # Look for price elements
            price_selectors = [
                '[class*="price"]',
                '[class*="cost"]',
                '[class*="total"]',
                '[class*="shipping"]',
                '[class*="tax"]',
                '[id*="price"]',
                '[id*="cost"]',
                '[id*="total"]'
            ]
            
            for selector in price_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed() and element.text.strip():
                        price_text = element.text.strip()
                        if '$' in price_text or 'price' in price_text.lower():
                            pricing_info['price_elements'].append({
                                'selector': selector,
                                'text': price_text,
                                'class': element.get_attribute('class'),
                                'id': element.get_attribute('id')
                            })
                            
                            # Try to categorize the price
                            if 'shipping' in price_text.lower():
                                pricing_info['shipping_price'] = price_text
                            elif 'tax' in price_text.lower():
                                pricing_info['tax'] = price_text
                            elif 'total' in price_text.lower():
                                pricing_info['total_price'] = price_text
                            elif pricing_info['product_price'] is None:
                                pricing_info['product_price'] = price_text
            
            order_result['total_costs'] = pricing_info
            logger.info(f"💰 Extracted {len(pricing_info['price_elements'])} price elements")
            
        except Exception as e:
            logger.error(f"❌ Error extracting pricing: {e}")
            order_result['errors'].append(f"Error extracting pricing: {e}")
    
    def extract_shipping_costs(self, order_result: Dict[str, Any]):
        """Extract shipping costs specifically"""
        try:
            logger.info("🚚 Extracting shipping costs...")
            
            shipping_costs = {
                'standard_shipping': None,
                'expedited_shipping': None,
                'overnight_shipping': None,
                'shipping_options': []
            }
            
            # Look for shipping-related elements
            shipping_selectors = [
                '[class*="shipping"]',
                '[class*="delivery"]',
                '[class*="freight"]',
                '[id*="shipping"]',
                '[id*="delivery"]',
                '[class*="method"]',
                '[class*="option"]'
            ]
            
            for selector in shipping_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed() and element.text.strip():
                        shipping_text = element.text.strip()
                        
                        # Parse shipping options from text
                        shipping_lines = shipping_text.split('\n')
                        for line in shipping_lines:
                            line = line.strip()
                            if line and ('shipping' in line.lower() or 'delivery' in line.lower() or 'pickup' in line.lower()):
                                shipping_costs['shipping_options'].append({
                                    'selector': selector,
                                    'text': line,
                                    'class': element.get_attribute('class'),
                                    'id': element.get_attribute('id')
                                })
                                
                                # Categorize shipping options
                                if 'standard' in line.lower() or 'ground' in line.lower():
                                    shipping_costs['standard_shipping'] = line
                                elif 'expedited' in line.lower() or 'express' in line.lower():
                                    shipping_costs['expedited_shipping'] = line
                                elif 'overnight' in line.lower():
                                    shipping_costs['overnight_shipping'] = line
                                elif 'pickup' in line.lower():
                                    shipping_costs['pickup_option'] = line
                                elif 'drop ship' in line.lower():
                                    shipping_costs['drop_ship_option'] = line
            
            order_result['shipping_costs'] = shipping_costs
            logger.info(f"🚚 Extracted {len(shipping_costs['shipping_options'])} shipping options")
            
        except Exception as e:
            logger.error(f"❌ Error extracting shipping costs: {e}")
            order_result['errors'].append(f"Error extracting shipping costs: {e}")
    
    def get_shipping_quote(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping quote for a product (main entry point)"""
        try:
            logger.info(f"🚚 Getting shipping quote for {product_details.get('product_type', 'unknown')} product...")
            
            # Create order mockup
            order_result = self.create_order_mockup(product_details)
            
            if 'error' in order_result:
                return order_result
            
            # Extract shipping information
            shipping_quote = {
                'partner': 'b2sign',
                'product_type': product_details.get('product_type'),
                'product_details': product_details,
                'shipping_costs': order_result.get('shipping_costs', {}),
                'total_costs': order_result.get('total_costs', {}),
                'success': order_result.get('success', False),
                'errors': order_result.get('errors', [])
            }
            
            # Determine if we got shipping costs
            shipping_costs = order_result.get('shipping_costs', {})
            if (shipping_costs.get('standard_shipping') or 
                shipping_costs.get('expedited_shipping') or 
                shipping_costs.get('overnight_shipping') or
                len(shipping_costs.get('shipping_options', [])) > 0):
                shipping_quote['success'] = True
                logger.info("✅ Successfully extracted shipping costs")
            else:
                shipping_quote['success'] = False
                shipping_quote['errors'].append("No shipping costs found")
                logger.warning("⚠️  No shipping costs found")
            
            return shipping_quote
            
        except Exception as e:
            logger.error(f"❌ Error getting shipping quote: {e}")
            return {'error': str(e), 'success': False}
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Browser closed")

def main():
    """Test the B2Sign order mockup system"""
    logger.info("🚀 Testing B2Sign order mockup system...")
    
    mockup = B2SignOrderMockup(headless=False)  # Set to False to see what's happening
    
    try:
        # Login
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        if mockup.login(username, password):
            # Test with sample product
            sample_product = {
                'product_type': 'banner',
                'material': 'vinyl',
                'width': 24,
                'height': 36,
                'quantity': 1,
                'zip_code': '10001',
                'job_name': 'BuyPrintz Test Quote'
            }
            
            # Get shipping quote
            shipping_quote = mockup.get_shipping_quote(sample_product)
            
            # Save results
            with open('b2sign_shipping_quote_test.json', 'w') as f:
                json.dump(shipping_quote, f, indent=2)
            
            logger.info("💾 Shipping quote test results saved to: b2sign_shipping_quote_test.json")
            
            # Print summary
            logger.info(f"\n📋 SHIPPING QUOTE TEST SUMMARY")
            logger.info(f"{'='*50}")
            logger.info(f"Success: {shipping_quote.get('success', False)}")
            logger.info(f"Product: {shipping_quote.get('product_type', 'unknown')}")
            logger.info(f"Errors: {len(shipping_quote.get('errors', []))}")
            
            if shipping_quote.get('shipping_costs'):
                shipping_costs = shipping_quote['shipping_costs']
                logger.info(f"Shipping options found: {len(shipping_costs.get('shipping_options', []))}")
                if shipping_costs.get('standard_shipping'):
                    logger.info(f"Standard shipping: {shipping_costs['standard_shipping']}")
                if shipping_costs.get('expedited_shipping'):
                    logger.info(f"Expedited shipping: {shipping_costs['expedited_shipping']}")
                if shipping_costs.get('overnight_shipping'):
                    logger.info(f"Overnight shipping: {shipping_costs['overnight_shipping']}")
            
            return shipping_quote
        else:
            logger.error("❌ Login failed, cannot proceed with order mockup")
            return None
    
    finally:
        mockup.close()

if __name__ == "__main__":
    main()
