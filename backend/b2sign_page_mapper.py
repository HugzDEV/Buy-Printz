#!/usr/bin/env python3
"""
B2Sign Page Mapper using Selenium
Maps the page structure to generate exact selectors for Playwright integration
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignPageMapper:
    def __init__(self):
        self.driver = None
        self.page_structure = {}
        
    def setup_driver(self):
        """Setup Chrome driver with options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        
    def login_and_navigate(self, username, password, product_url):
        """Login and navigate to product page"""
        try:
            logger.info("🌐 Navigating to B2Sign login page...")
            self.driver.get("https://www.b2sign.com/login")
            
            # Login
            logger.info("🔐 Logging in...")
            username_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            password_field = self.driver.find_element(By.NAME, "password")
            
            username_field.send_keys(username)
            password_field.send_keys(password)
            
            login_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            
            # Wait for login to complete
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "body"))
            )
            
            logger.info("✅ Login successful!")
            
            # Navigate to product page
            logger.info(f"🌐 Navigating to product page: {product_url}")
            self.driver.get(product_url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "body"))
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error during login/navigation: {e}")
            return False
    
    def map_dimension_inputs(self):
        """Map dimension input fields"""
        logger.info("📏 Mapping dimension input fields...")
        
        dimension_inputs = []
        inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='number'], input[type='text']")
        
        for i, input_elem in enumerate(inputs):
            try:
                # Get element details
                element_info = {
                    'index': i,
                    'tag': input_elem.tag_name,
                    'type': input_elem.get_attribute('type'),
                    'name': input_elem.get_attribute('name'),
                    'id': input_elem.get_attribute('id'),
                    'class': input_elem.get_attribute('class'),
                    'placeholder': input_elem.get_attribute('placeholder'),
                    'value': input_elem.get_attribute('value'),
                    'visible': input_elem.is_displayed(),
                    'enabled': input_elem.is_enabled(),
                    'location': input_elem.location,
                    'size': input_elem.size
                }
                
                # Try to find associated label
                try:
                    label = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{element_info['id']}']")
                    element_info['label_text'] = label.text
                except:
                    element_info['label_text'] = None
                
                # Try to find parent container with text
                try:
                    parent = input_elem.find_element(By.XPATH, "..")
                    element_info['parent_text'] = parent.text[:100]  # Limit text length
                except:
                    element_info['parent_text'] = None
                
                dimension_inputs.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not map input {i}: {e}")
        
        self.page_structure['dimension_inputs'] = dimension_inputs
        logger.info(f"✅ Mapped {len(dimension_inputs)} dimension inputs")
        
    def map_radio_buttons(self):
        """Map radio button elements"""
        logger.info("📻 Mapping radio button elements...")
        
        radio_buttons = []
        radios = self.driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        
        for i, radio in enumerate(radios):
            try:
                element_info = {
                    'index': i,
                    'tag': radio.tag_name,
                    'type': radio.get_attribute('type'),
                    'name': radio.get_attribute('name'),
                    'id': radio.get_attribute('id'),
                    'class': radio.get_attribute('class'),
                    'value': radio.get_attribute('value'),
                    'checked': radio.is_selected(),
                    'visible': radio.is_displayed(),
                    'enabled': radio.is_enabled(),
                    'location': radio.location,
                    'size': radio.size
                }
                
                # Find associated text/label
                try:
                    # Try different methods to find associated text
                    label = None
                    
                    # Method 1: Look for label with for attribute
                    if element_info['id']:
                        try:
                            label = self.driver.find_element(By.CSS_SELECTOR, f"label[for='{element_info['id']}']")
                        except:
                            pass
                    
                    # Method 2: Look for parent with text
                    if not label:
                        try:
                            parent = radio.find_element(By.XPATH, "..")
                            if parent.text.strip():
                                label = parent
                        except:
                            pass
                    
                    # Method 3: Look for sibling with text
                    if not label:
                        try:
                            parent = radio.find_element(By.XPATH, "..")
                            siblings = parent.find_elements(By.XPATH, "*")
                            for sibling in siblings:
                                if sibling.text.strip() and sibling.tag_name != 'input':
                                    label = sibling
                                    break
                        except:
                            pass
                    
                    if label:
                        element_info['label_text'] = label.text.strip()
                        element_info['label_tag'] = label.tag_name
                        element_info['label_class'] = label.get_attribute('class')
                    else:
                        element_info['label_text'] = None
                        
                except Exception as e:
                    element_info['label_text'] = None
                
                radio_buttons.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not map radio button {i}: {e}")
        
        self.page_structure['radio_buttons'] = radio_buttons
        logger.info(f"✅ Mapped {len(radio_buttons)} radio buttons")
        
    def map_dropdowns(self):
        """Map dropdown/select elements"""
        logger.info("📋 Mapping dropdown elements...")
        
        dropdowns = []
        
        # Standard select elements
        selects = self.driver.find_elements(By.CSS_SELECTOR, "select")
        for i, select in enumerate(selects):
            try:
                element_info = {
                    'index': i,
                    'type': 'select',
                    'tag': select.tag_name,
                    'name': select.get_attribute('name'),
                    'id': select.get_attribute('id'),
                    'class': select.get_attribute('class'),
                    'visible': select.is_displayed(),
                    'enabled': select.is_enabled(),
                    'location': select.location,
                    'size': select.size
                }
                
                # Get options
                options = select.find_elements(By.CSS_SELECTOR, "option")
                element_info['options'] = [opt.text for opt in options]
                
                dropdowns.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not map select {i}: {e}")
        
        # MUI dropdowns (buttons that open dropdowns)
        mui_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button, [role='button']")
        for i, button in enumerate(mui_buttons):
            try:
                text = button.text.strip()
                if any(keyword in text.lower() for keyword in ['ground', 'shipping', 'select', 'choose', 'option']):
                    element_info = {
                        'index': i,
                        'type': 'mui_button',
                        'tag': button.tag_name,
                        'text': text,
                        'class': button.get_attribute('class'),
                        'id': button.get_attribute('id'),
                        'visible': button.is_displayed(),
                        'enabled': button.is_enabled(),
                        'location': button.location,
                        'size': button.size
                    }
                    dropdowns.append(element_info)
                    
            except Exception as e:
                continue
        
        self.page_structure['dropdowns'] = dropdowns
        logger.info(f"✅ Mapped {len(dropdowns)} dropdown elements")
        
    def map_buttons(self):
        """Map button elements"""
        logger.info("🔘 Mapping button elements...")
        
        buttons = []
        button_elements = self.driver.find_elements(By.CSS_SELECTOR, "button, input[type='button'], input[type='submit'], [role='button']")
        
        for i, button in enumerate(button_elements):
            try:
                element_info = {
                    'index': i,
                    'tag': button.tag_name,
                    'type': button.get_attribute('type'),
                    'text': button.text.strip(),
                    'class': button.get_attribute('class'),
                    'id': button.get_attribute('id'),
                    'name': button.get_attribute('name'),
                    'visible': button.is_displayed(),
                    'enabled': button.is_enabled(),
                    'location': button.location,
                    'size': button.size
                }
                
                buttons.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not map button {i}: {e}")
        
        self.page_structure['buttons'] = buttons
        logger.info(f"✅ Mapped {len(buttons)} button elements")
        
    def map_shipping_section(self):
        """Specifically map the shipping section"""
        logger.info("🚚 Mapping shipping section...")
        
        shipping_section = {}
        
        # Look for shipping-related elements
        shipping_keywords = ['shipping', 'ship', 'delivery', 'blind drop', 'store pickup']
        
        # Find elements containing shipping keywords
        all_elements = self.driver.find_elements(By.CSS_SELECTOR, "*")
        shipping_elements = []
        
        for element in all_elements:
            try:
                text = element.text.lower()
                if any(keyword in text for keyword in shipping_keywords):
                    element_info = {
                        'tag': element.tag_name,
                        'text': element.text.strip(),
                        'class': element.get_attribute('class'),
                        'id': element.get_attribute('id'),
                        'location': element.location,
                        'size': element.size
                    }
                    shipping_elements.append(element_info)
            except:
                continue
        
        shipping_section['elements'] = shipping_elements
        
        # Look for "Ship to" edit button specifically
        edit_buttons = []
        for element in all_elements:
            try:
                text = element.text.lower()
                if 'edit' in text and ('ship' in text or 'address' in text):
                    element_info = {
                        'tag': element.tag_name,
                        'text': element.text.strip(),
                        'class': element.get_attribute('class'),
                        'id': element.get_attribute('id'),
                        'location': element.location,
                        'size': element.size
                    }
                    edit_buttons.append(element_info)
            except:
                continue
        
        shipping_section['edit_buttons'] = edit_buttons
        
        self.page_structure['shipping_section'] = shipping_section
        logger.info(f"✅ Mapped {len(shipping_elements)} shipping elements and {len(edit_buttons)} edit buttons")
        
    def generate_playwright_selectors(self):
        """Generate optimized selectors for Playwright"""
        logger.info("🎯 Generating Playwright selectors...")
        
        selectors = {
            'dimension_inputs': [],
            'radio_buttons': [],
            'dropdowns': [],
            'buttons': [],
            'shipping_elements': []
        }
        
        # Generate selectors for dimension inputs
        for input_info in self.page_structure.get('dimension_inputs', []):
            if input_info['visible'] and input_info['enabled']:
                selector = self._generate_selector(input_info)
                if selector:
                    selectors['dimension_inputs'].append({
                        'selector': selector,
                        'description': input_info.get('label_text', 'Unknown input'),
                        'element_info': input_info
                    })
        
        # Generate selectors for radio buttons
        for radio_info in self.page_structure.get('radio_buttons', []):
            if radio_info['visible'] and radio_info['enabled']:
                selector = self._generate_selector(radio_info)
                if selector:
                    selectors['radio_buttons'].append({
                        'selector': selector,
                        'description': radio_info.get('label_text', 'Unknown radio'),
                        'element_info': radio_info
                    })
        
        # Generate selectors for buttons
        for button_info in self.page_structure.get('buttons', []):
            if button_info['visible'] and button_info['enabled']:
                selector = self._generate_selector(button_info)
                if selector:
                    selectors['buttons'].append({
                        'selector': selector,
                        'description': button_info.get('text', 'Unknown button'),
                        'element_info': button_info
                    })
        
        return selectors
    
    def _generate_selector(self, element_info):
        """Generate the best selector for an element"""
        selectors = []
        
        # Try ID first
        if element_info.get('id'):
            selectors.append(f"#{element_info['id']}")
        
        # Try name
        if element_info.get('name'):
            selectors.append(f"[name='{element_info['name']}']")
        
        # Try class (be careful with MUI classes)
        if element_info.get('class'):
            classes = element_info['class'].split()
            for cls in classes:
                if cls.startswith('Mui') and len(cls) > 10:  # MUI classes are long
                    selectors.append(f".{cls}")
        
        # Try text-based selectors
        if element_info.get('text'):
            text = element_info['text'].strip()
            if text:
                selectors.append(f"text='{text}'")
        
        # Try label text
        if element_info.get('label_text'):
            label_text = element_info['label_text'].strip()
            if label_text:
                selectors.append(f"text='{label_text}'")
        
        # Return the most specific selector
        return selectors[0] if selectors else None
    
    def save_mapping(self, filename="b2sign_page_mapping.json"):
        """Save the page mapping to a JSON file"""
        try:
            with open(filename, 'w') as f:
                json.dump(self.page_structure, f, indent=2, default=str)
            logger.info(f"✅ Page mapping saved to {filename}")
        except Exception as e:
            logger.error(f"❌ Error saving mapping: {e}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()

def main():
    """Main function to run the page mapper"""
    mapper = B2SignPageMapper()
    
    try:
        # Setup
        mapper.setup_driver()
        
        # Use existing B2Sign credentials
        username = "order@buyprintz.com"
        password = "$AG@BuyPr!n1z"
        
        if mapper.login_and_navigate(username, password, "https://www.b2sign.com/13oz-vinyl-banner"):
            
            # Map all elements
            mapper.map_dimension_inputs()
            mapper.map_radio_buttons()
            mapper.map_dropdowns()
            mapper.map_buttons()
            mapper.map_shipping_section()
            
            # Generate selectors
            selectors = mapper.generate_playwright_selectors()
            
            # Save mapping
            mapper.save_mapping()
            
            # Print summary
            print("\n" + "="*50)
            print("🎯 B2SIGN PAGE MAPPING COMPLETE")
            print("="*50)
            print(f"📏 Dimension inputs: {len(selectors['dimension_inputs'])}")
            print(f"📻 Radio buttons: {len(selectors['radio_buttons'])}")
            print(f"📋 Dropdowns: {len(selectors['dropdowns'])}")
            print(f"🔘 Buttons: {len(selectors['buttons'])}")
            print(f"🚚 Shipping elements: {len(selectors['shipping_elements'])}")
            print("="*50)
            
            # Show key findings
            print("\n🔍 KEY FINDINGS:")
            
            # Show radio buttons
            print("\n📻 Radio Buttons:")
            for radio in selectors['radio_buttons']:
                print(f"  - {radio['description']}: {radio['selector']}")
            
            # Show shipping-related buttons
            print("\n🚚 Shipping Buttons:")
            for button in selectors['buttons']:
                if any(keyword in button['description'].lower() for keyword in ['ship', 'edit', 'address']):
                    print(f"  - {button['description']}: {button['selector']}")
            
            # Show dimension inputs
            print("\n📏 Dimension Inputs:")
            for input_elem in selectors['dimension_inputs']:
                print(f"  - {input_elem['description']}: {input_elem['selector']}")
    
    except Exception as e:
        logger.error(f"❌ Error during mapping: {e}")
    
    finally:
        mapper.close()

if __name__ == "__main__":
    main()
