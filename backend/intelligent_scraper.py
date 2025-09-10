from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import json
import re
import time
import logging
from typing import Dict, List, Optional, Any
import os

logger = logging.getLogger(__name__)

class IntelligentScraper:
    """
    Intelligent web scraper using Selenium with site mapping intelligence.
    Automates quote generation on print partner websites.
    """
    
    def __init__(self, site_map_file: str, headless: bool = True):
        # Load the site intelligence
        with open(site_map_file, 'r') as f:
            self.site_map = json.load(f)
        
        # Setup Selenium with Railway-compatible configuration
        self.driver = self._setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 15)
        
    def _setup_driver(self, headless: bool) -> webdriver.Chrome:
        """Setup Chrome driver with Railway-compatible options."""
        options = Options()
        
        if headless:
            options.add_argument('--headless')
        
        # Railway-compatible options
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-background-timer-throttling')
        options.add_argument('--disable-backgrounding-occluded-windows')
        options.add_argument('--disable-renderer-backgrounding')
        options.add_argument('--disable-features=TranslateUI')
        options.add_argument('--disable-ipc-flooding-protection')
        options.add_argument('--window-size=1920,1080')
        
        # Memory and performance optimizations
        options.add_argument('--memory-pressure-off')
        options.add_argument('--max_old_space_size=4096')
        
        # User agent
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        # Disable images and CSS for faster loading (optional)
        # prefs = {
        #     "profile.managed_default_content_settings.images": 2,
        #     "profile.managed_default_content_settings.stylesheets": 2
        # }
        # options.add_experimental_option("prefs", prefs)
        
        try:
            # Try to use system Chrome binary (Railway)
            driver = webdriver.Chrome(options=options)
            logger.info("Chrome driver initialized successfully")
            return driver
        except Exception as e:
            logger.error(f"Failed to initialize Chrome driver: {e}")
            raise
    
    def login_with_intelligence(self, username: str, password: str) -> bool:
        """
        Use mapped login form structure to authenticate.
        """
        try:
            if 'login' not in self.site_map['forms']:
                raise Exception("No login form mapping found")
            
            login_form = self.site_map['forms']['login']
            
            # Navigate to login page
            self.driver.get(login_form['action_url'])
            time.sleep(2)  # Allow page to load
            
            # Use the mapped selectors to find and fill fields
            for field_name, field_info in login_form['fields'].items():
                try:
                    element = self.wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, field_info['selector']))
                    )
                    
                    # Clear field first
                    element.clear()
                    
                    # Fill field based on type and name
                    if field_info['type'] == 'password':
                        element.send_keys(password)
                    elif field_info['type'] in ['text', 'email']:
                        # Intelligent field detection
                        if any(term in field_name.lower() for term in ['user', 'email', 'login', 'username']):
                            element.send_keys(username)
                        else:
                            # Try to fill with default value if available
                            if field_info.get('placeholder'):
                                element.send_keys(field_info['placeholder'])
                    
                except TimeoutException:
                    logger.warning(f"Could not find field {field_name} with selector {field_info['selector']}")
                    continue
                except Exception as e:
                    logger.warning(f"Could not fill field {field_name}: {e}")
                    continue
            
            # Submit form
            submit_selectors = [
                "input[type='submit']",
                "button[type='submit']",
                "button:contains('Login')",
                "button:contains('Sign In')",
                "input[value*='Login']",
                "input[value*='Sign In']"
            ]
            
            submitted = False
            for selector in submit_selectors:
                try:
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    submit_button.click()
                    submitted = True
                    break
                except NoSuchElementException:
                    continue
            
            if not submitted:
                # Fallback: try to submit the form directly
                forms = self.driver.find_elements(By.TAG_NAME, "form")
                if forms:
                    forms[0].submit()
            
            # Wait for navigation/response
            time.sleep(3)
            
            # Check if login was successful
            current_url = self.driver.current_url
            if 'login' not in current_url.lower() or 'dashboard' in current_url.lower():
                logger.info("Login successful")
                return True
            else:
                logger.error("Login failed - still on login page")
                return False
                
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return False
    
    def get_quote_with_intelligence(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use mapped quote form structure to get shipping quote.
        """
        try:
            if 'quote' not in self.site_map['forms']:
                raise Exception("No quote form mapping found")
            
            quote_form = self.site_map['forms']['quote']
            
            # Navigate to quote form
            self.driver.get(quote_form['action_url'])
            time.sleep(2)  # Allow page to load
            
            # Wait for any dynamic loading
            if 'dynamic' in self.site_map and self.site_map['dynamic']['loading_indicators']:
                for loading_selector in self.site_map['dynamic']['loading_indicators']:
                    try:
                        # Wait for loading indicator to disappear
                        self.wait.until(EC.invisibility_of_element_located(
                            (By.CSS_SELECTOR, loading_selector)
                        ))
                    except TimeoutException:
                        pass  # Loading indicator might not appear
            
            # Fill form using mapped intelligence
            field_mappings = self._create_field_mappings(product_details)
            
            for field_name, field_info in quote_form['fields'].items():
                if field_name in field_mappings:
                    try:
                        element = self.wait.until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, field_info['selector']))
                        )
                        
                        if field_info['type'] == 'select':
                            # Handle dropdown with intelligence
                            select = Select(element)
                            value_to_select = field_mappings[field_name]
                            
                            # Try different selection methods
                            selection_success = False
                            
                            # Try exact value match
                            try:
                                select.select_by_value(str(value_to_select))
                                selection_success = True
                            except:
                                pass
                            
                            # Try partial text match
                            if not selection_success:
                                try:
                                    select.select_by_visible_text(str(value_to_select))
                                    selection_success = True
                                except:
                                    pass
                            
                            # Try partial value match
                            if not selection_success:
                                for option in select.options:
                                    if str(value_to_select).lower() in option.text.lower():
                                        select.select_by_visible_text(option.text)
                                        selection_success = True
                                        break
                            
                            if not selection_success:
                                logger.warning(f"Could not select value {value_to_select} for field {field_name}")
                        
                        else:
                            # Handle text inputs
                            element.clear()
                            element.send_keys(str(field_mappings[field_name]))
                            
                    except TimeoutException:
                        logger.warning(f"Could not find field {field_name} with selector {field_info['selector']}")
                        continue
                    except Exception as e:
                        logger.warning(f"Could not fill field {field_name}: {e}")
                        continue
            
            # Submit quote request
            submitted = False
            for selector in quote_form['submit_selectors']:
                try:
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    submit_button.click()
                    submitted = True
                    break
                except NoSuchElementException:
                    continue
            
            if not submitted:
                # Fallback submit methods
                fallback_selectors = [
                    "input[type='submit']",
                    "button[type='submit']",
                    "button:contains('Calculate')",
                    "button:contains('Quote')",
                    "button:contains('Get Quote')",
                    "button:contains('Estimate')"
                ]
                
                for selector in fallback_selectors:
                    try:
                        submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        submit_button.click()
                        submitted = True
                        break
                    except NoSuchElementException:
                        continue
            
            if not submitted:
                raise Exception("Could not find submit button")
            
            # Wait for results
            time.sleep(5)  # Allow time for quote calculation
            
            # Extract shipping cost using mapped selectors
            return self._extract_shipping_cost(quote_form['result_selectors'])
            
        except Exception as e:
            logger.error(f"Failed to get quote: {e}")
            return {'success': False, 'error': str(e)}
    
    def _create_field_mappings(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map product details to form field names using site intelligence.
        """
        mappings = {}
        
        if 'quote' not in self.site_map['forms']:
            return mappings
        
        quote_form = self.site_map['forms']['quote']
        
        # Create intelligent field mappings based on common naming patterns
        field_patterns = {
            'width': ['width', 'w', 'dimension_width', 'size_width', 'x'],
            'height': ['height', 'h', 'dimension_height', 'size_height', 'y'],
            'material': ['material', 'substrate', 'product_type', 'type', 'media'],
            'quantity': ['quantity', 'qty', 'amount', 'count', 'pieces'],
            'zip_code': ['zip', 'zipcode', 'postal_code', 'zip_code', 'postal'],
            'weight': ['weight', 'lbs', 'pounds', 'kg', 'kilograms'],
            'dimensions': ['dimensions', 'size', 'measurements', 'specs'],
            'product_type': ['product', 'item', 'category', 'type']
        }
        
        for product_key, product_value in product_details.items():
            if product_key in field_patterns:
                # Find matching field name in the form
                for pattern in field_patterns[product_key]:
                    for form_field_name in quote_form['fields'].keys():
                        if pattern.lower() in form_field_name.lower():
                            mappings[form_field_name] = product_value
                            break
                    if form_field_name in mappings:
                        break
        
        return mappings
    
    def _extract_shipping_cost(self, result_selectors: List[str]) -> Dict[str, Any]:
        """
        Extract shipping cost using mapped result selectors.
        """
        import re
        
        for selector in result_selectors:
            try:
                # Wait for result to appear
                result_element = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                
                result_text = result_element.text
                
                # Look for dollar amounts
                cost_patterns = [
                    r'\$(\d+\.?\d*)',
                    r'(\d+\.?\d*)\s*dollars?',
                    r'cost:\s*\$?(\d+\.?\d*)',
                    r'total:\s*\$?(\d+\.?\d*)',
                    r'shipping:\s*\$?(\d+\.?\d*)'
                ]
                
                for pattern in cost_patterns:
                    cost_match = re.search(pattern, result_text, re.IGNORECASE)
                    if cost_match:
                        return {
                            'success': True,
                            'shipping_cost': float(cost_match.group(1)),
                            'raw_text': result_text,
                            'selector_used': selector,
                            'method': 'mapped_selector'
                        }
                        
            except TimeoutException:
                continue  # Try next selector
            except Exception as e:
                logger.warning(f"Error with selector {selector}: {e}")
                continue
        
        # If no mapped selectors worked, try fallback search
        return self._fallback_cost_extraction()
    
    def _fallback_cost_extraction(self) -> Dict[str, Any]:
        """
        Fallback method to find shipping costs when mapped selectors fail.
        """
        import re
        
        try:
            # Look for common shipping cost patterns in page
            potential_elements = self.driver.find_elements(By.XPATH, 
                "//*[contains(text(), '$') and (contains(text(), 'ship') or contains(text(), 'Ship') or contains(text(), 'total') or contains(text(), 'Total') or contains(text(), 'cost') or contains(text(), 'Cost'))]")
            
            for element in potential_elements:
                text = element.text
                cost_match = re.search(r'\$(\d+\.?\d*)', text)
                if cost_match:
                    return {
                        'success': True,
                        'shipping_cost': float(cost_match.group(1)),
                        'raw_text': text,
                        'method': 'fallback_xpath'
                    }
            
            # Try to find any element with dollar amounts
            all_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), '$')]")
            for element in all_elements:
                text = element.text
                cost_match = re.search(r'\$(\d+\.?\d*)', text)
                if cost_match:
                    return {
                        'success': True,
                        'shipping_cost': float(cost_match.group(1)),
                        'raw_text': text,
                        'method': 'fallback_any_dollar'
                    }
            
            return {'success': False, 'error': 'Could not extract shipping cost using any method'}
            
        except Exception as e:
            return {'success': False, 'error': f'Fallback extraction failed: {e}'}
    
    def take_screenshot(self, filename: str = None) -> str:
        """Take a screenshot for debugging purposes."""
        if not filename:
            filename = f"debug_screenshot_{int(time.time())}.png"
        
        try:
            self.driver.save_screenshot(filename)
            logger.info(f"Screenshot saved: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Failed to take screenshot: {e}")
            return ""
    
    def close(self):
        """Close the browser and cleanup."""
        try:
            self.driver.quit()
            logger.info("Browser closed successfully")
        except Exception as e:
            logger.error(f"Error closing browser: {e}")
