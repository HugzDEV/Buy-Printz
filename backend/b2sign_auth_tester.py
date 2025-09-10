#!/usr/bin/env python3
"""
B2Sign Authentication Tester
This script tests the authentication process with better error handling and debugging.
"""

import time
import json
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementNotInteractableException

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignAuthTester:
    def __init__(self, headless=False):
        self.base_url = 'https://b2sign.com'
        self.driver = self.setup_driver(headless)
        self.wait = WebDriverWait(self.driver, 20)
        self.authenticated = False
    
    def setup_driver(self, headless=False):
        """Setup Chrome driver with better options"""
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
    
    def debug_page_state(self):
        """Debug the current page state"""
        try:
            logger.info(f"🔍 Current URL: {self.driver.current_url}")
            logger.info(f"🔍 Page title: {self.driver.title}")
            
            # Check if page is fully loaded
            ready_state = self.driver.execute_script("return document.readyState")
            logger.info(f"🔍 Document ready state: {ready_state}")
            
            # Check for React/Inertia indicators
            react_indicators = self.driver.execute_script("""
                return {
                    hasReact: typeof window.React !== 'undefined',
                    hasInertia: typeof window.Inertia !== 'undefined',
                    hasApp: document.getElementById('app') !== null
                }
            """)
            logger.info(f"🔍 React/Inertia indicators: {react_indicators}")
            
            # Find all input elements
            inputs = self.driver.find_elements(By.TAG_NAME, 'input')
            logger.info(f"🔍 Found {len(inputs)} input elements")
            
            for i, input_elem in enumerate(inputs):
                try:
                    input_info = {
                        'index': i,
                        'type': input_elem.get_attribute('type'),
                        'name': input_elem.get_attribute('name'),
                        'id': input_elem.get_attribute('id'),
                        'placeholder': input_elem.get_attribute('placeholder'),
                        'visible': input_elem.is_displayed(),
                        'enabled': input_elem.is_enabled()
                    }
                    logger.info(f"🔍 Input {i}: {input_info}")
                except Exception as e:
                    logger.warning(f"⚠️  Could not get input {i} info: {e}")
            
            # Find all button elements
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            logger.info(f"🔍 Found {len(buttons)} button elements")
            
            for i, button in enumerate(buttons):
                try:
                    button_info = {
                        'index': i,
                        'text': button.text,
                        'type': button.get_attribute('type'),
                        'class': button.get_attribute('class'),
                        'visible': button.is_displayed(),
                        'enabled': button.is_enabled()
                    }
                    logger.info(f"🔍 Button {i}: {button_info}")
                except Exception as e:
                    logger.warning(f"⚠️  Could not get button {i} info: {e}")
            
        except Exception as e:
            logger.error(f"❌ Error debugging page state: {e}")
    
    def wait_for_react_load(self, timeout=30):
        """Wait for React/Inertia to fully load"""
        logger.info("⏳ Waiting for React/Inertia to load...")
        
        try:
            # Wait for document ready
            self.wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
            
            # Wait for React/Inertia app to be present
            self.wait.until(EC.presence_of_element_located((By.ID, 'app')))
            
            # Wait for any loading indicators to disappear
            time.sleep(3)
            
            # Check if React is loaded
            react_loaded = self.driver.execute_script("""
                return typeof window.React !== 'undefined' || 
                       typeof window.Inertia !== 'undefined' ||
                       document.querySelector('[data-inertia]') !== null
            """)
            
            if react_loaded:
                logger.info("✅ React/Inertia loaded successfully")
                return True
            else:
                logger.warning("⚠️  React/Inertia may not be fully loaded")
                return False
                
        except TimeoutException:
            logger.warning("⚠️  Timeout waiting for React/Inertia to load")
            return False
        except Exception as e:
            logger.error(f"❌ Error waiting for React load: {e}")
            return False
    
    def find_login_fields(self):
        """Find login fields with multiple strategies"""
        logger.info("🔍 Searching for login fields...")
        
        email_field = None
        password_field = None
        
        # Strategy 1: Find by placeholder
        email_selectors = [
            'input[placeholder*="Email" i]',
            'input[placeholder*="email" i]',
            'input[placeholder*="Email Address" i]'
        ]
        
        for selector in email_selectors:
            try:
                email_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                if email_field.is_displayed() and email_field.is_enabled():
                    logger.info(f"✅ Found email field with selector: {selector}")
                    break
            except NoSuchElementException:
                continue
        
        # Strategy 2: Find by type
        if not email_field:
            try:
                email_field = self.driver.find_element(By.CSS_SELECTOR, 'input[type="email"]')
                if email_field.is_displayed() and email_field.is_enabled():
                    logger.info("✅ Found email field by type")
            except NoSuchElementException:
                pass
        
        # Strategy 3: Find by name/id
        if not email_field:
            name_selectors = [
                'input[name*="email" i]',
                'input[id*="email" i]',
                'input[name*="user" i]',
                'input[id*="user" i]'
            ]
            
            for selector in name_selectors:
                try:
                    email_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if email_field.is_displayed() and email_field.is_enabled():
                        logger.info(f"✅ Found email field with selector: {selector}")
                        break
                except NoSuchElementException:
                    continue
        
        # Find password field
        password_selectors = [
            'input[type="password"]',
            'input[placeholder*="Password" i]',
            'input[placeholder*="password" i]',
            'input[name*="password" i]',
            'input[id*="password" i]'
        ]
        
        for selector in password_selectors:
            try:
                password_field = self.driver.find_element(By.CSS_SELECTOR, selector)
                if password_field.is_displayed() and password_field.is_enabled():
                    logger.info(f"✅ Found password field with selector: {selector}")
                    break
            except NoSuchElementException:
                continue
        
        return email_field, password_field
    
    def fill_login_form(self, email_field, password_field, username, password):
        """Fill the login form with better error handling"""
        try:
            logger.info("📝 Filling login form...")
            
            # Clear and fill email field
            if email_field:
                # Scroll to element
                self.driver.execute_script("arguments[0].scrollIntoView(true);", email_field)
                time.sleep(1)
                
                # Try multiple methods to interact with the field
                try:
                    email_field.clear()
                    email_field.send_keys(username)
                    logger.info("✅ Email field filled successfully")
                except ElementNotInteractableException:
                    # Try JavaScript approach
                    self.driver.execute_script("arguments[0].value = arguments[1];", email_field, username)
                    # Trigger change event
                    self.driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", email_field)
                    logger.info("✅ Email field filled via JavaScript")
            
            time.sleep(1)
            
            # Clear and fill password field
            if password_field:
                # Scroll to element
                self.driver.execute_script("arguments[0].scrollIntoView(true);", password_field)
                time.sleep(1)
                
                try:
                    password_field.clear()
                    password_field.send_keys(password)
                    logger.info("✅ Password field filled successfully")
                except ElementNotInteractableException:
                    # Try JavaScript approach
                    self.driver.execute_script("arguments[0].value = arguments[1];", password_field, password)
                    # Trigger change event
                    self.driver.execute_script("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", password_field)
                    logger.info("✅ Password field filled via JavaScript")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error filling login form: {e}")
            return False
    
    def submit_login_form(self):
        """Submit the login form"""
        try:
            logger.info("🚀 Submitting login form...")
            
            # Strategy 1: Find submit button
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button',
                'input[type="button"]'
            ]
            
            submit_button = None
            for selector in submit_selectors:
                try:
                    submit_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if submit_button.is_displayed() and submit_button.is_enabled():
                        logger.info(f"✅ Found submit button with selector: {selector}")
                        break
                except NoSuchElementException:
                    continue
            
            # Strategy 2: Look for buttons with specific text (including member sign in)
            if not submit_button:
                try:
                    buttons = self.driver.find_elements(By.TAG_NAME, 'button')
                    for button in buttons:
                        button_text = button.text.lower()
                        if any(text in button_text for text in ['login', 'sign in', 'submit', 'log in', 'member', 'sign']):
                            if button.is_displayed() and button.is_enabled():
                                submit_button = button
                                logger.info(f"✅ Found submit button by text: {button_text}")
                                break
                except Exception as e:
                    logger.warning(f"⚠️  Error finding buttons by text: {e}")
            
            if submit_button:
                try:
                    # Re-find the button to avoid stale element reference
                    logger.info("🔄 Re-finding submit button to avoid stale reference...")
                    buttons = self.driver.find_elements(By.TAG_NAME, 'button')
                    fresh_submit_button = None
                    for button in buttons:
                        button_text = button.text.lower()
                        if 'member sign in' in button_text and button.is_displayed() and button.is_enabled():
                            fresh_submit_button = button
                            break
                    
                    if fresh_submit_button:
                        # Scroll to button and click
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", fresh_submit_button)
                        time.sleep(1)
                        fresh_submit_button.click()
                        logger.info("✅ Submit button clicked")
                    else:
                        raise Exception("Could not re-find submit button")
                        
                except ElementNotInteractableException:
                    # Try JavaScript click
                    self.driver.execute_script("arguments[0].click();", fresh_submit_button)
                    logger.info("✅ Submit button clicked via JavaScript")
                except Exception as e:
                    logger.error(f"❌ Error clicking submit button: {e}")
                    # Fall back to JavaScript form submission
                    try:
                        forms = self.driver.find_elements(By.TAG_NAME, 'form')
                        if forms:
                            form = forms[0]
                            self.driver.execute_script("arguments[0].submit();", form)
                            logger.info("✅ Form submitted via JavaScript fallback")
                        else:
                            return False
                    except Exception as e2:
                        logger.error(f"❌ JavaScript form submission also failed: {e2}")
                        return False
            else:
                # Strategy 3: Try JavaScript form submission
                try:
                    logger.info("🔧 Attempting JavaScript form submission...")
                    # Find the form and submit it via JavaScript
                    forms = self.driver.find_elements(By.TAG_NAME, 'form')
                    if forms:
                        form = forms[0]  # Use the first form
                        self.driver.execute_script("arguments[0].submit();", form)
                        logger.info("✅ Form submitted via JavaScript")
                    else:
                        # Strategy 4: Press Enter on password field
                        password_field = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
                        password_field.send_keys(Keys.RETURN)
                        logger.info("✅ Pressed Enter on password field")
                except Exception as e:
                    logger.error(f"❌ Could not submit form: {e}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error submitting login form: {e}")
            return False
    
    def check_login_success(self):
        """Check if login was successful with multiple indicators"""
        try:
            logger.info("🔍 Checking login success...")
            
            # Wait for page to load after login attempt
            time.sleep(5)
            
            # Check current URL
            current_url = self.driver.current_url
            logger.info(f"🔍 Current URL after login: {current_url}")
            
            # Check for redirect away from login page
            if 'login' not in current_url.lower():
                logger.info("✅ Redirected away from login page")
                return True
            
            # Check page content for success indicators
            page_source = self.driver.page_source.lower()
            
            success_indicators = [
                'dashboard', 'account', 'profile', 'logout', 'welcome',
                'my account', 'user menu', 'sign out', 'logged in'
            ]
            
            error_indicators = [
                'error', 'invalid', 'failed', 'incorrect', 'wrong',
                'login failed', 'authentication failed'
            ]
            
            # Check for success indicators
            found_success = any(indicator in page_source for indicator in success_indicators)
            found_error = any(indicator in page_source for indicator in error_indicators)
            
            if found_success:
                logger.info("✅ Found success indicators in page content")
                return True
            
            if found_error:
                logger.warning("⚠️  Found error indicators in page content")
                return False
            
            # Check for form elements (if still present, login likely failed)
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            if len(forms) > 0:
                logger.warning("⚠️  Login forms still present, login may have failed")
                return False
            
            logger.info("✅ No error indicators found, assuming login success")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error checking login success: {e}")
            return False
    
    def test_authentication(self, username, password):
        """Test the complete authentication process"""
        try:
            logger.info("🚀 Starting authentication test...")
            
            # Navigate to homepage
            logger.info(f"🌐 Navigating to: {self.base_url}")
            self.driver.get(self.base_url)
            
            # Wait for React to load
            if not self.wait_for_react_load():
                logger.warning("⚠️  React may not be fully loaded, continuing anyway")
            
            # Debug page state
            self.debug_page_state()
            
            # Find login fields
            email_field, password_field = self.find_login_fields()
            
            if not email_field or not password_field:
                logger.error("❌ Could not find login fields")
                return False
            
            # Fill login form
            if not self.fill_login_form(email_field, password_field, username, password):
                logger.error("❌ Failed to fill login form")
                return False
            
            # Submit login form
            if not self.submit_login_form():
                logger.error("❌ Failed to submit login form")
                return False
            
            # Check login success
            if self.check_login_success():
                self.authenticated = True
                logger.info("✅ Authentication test successful!")
                return True
            else:
                logger.error("❌ Authentication test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Authentication test error: {e}")
            return False
    
    def save_screenshot(self, filename):
        """Save a screenshot for debugging"""
        try:
            self.driver.save_screenshot(filename)
            logger.info(f"📸 Screenshot saved: {filename}")
        except Exception as e:
            logger.error(f"❌ Failed to save screenshot: {e}")
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            logger.info("🔒 Browser closed")

def main():
    """Run the authentication test"""
    logger.info("🚀 Starting B2Sign authentication test...")
    
    tester = B2SignAuthTester(headless=False)  # Set to False to see what's happening
    
    try:
        # Test credentials
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        # Run authentication test
        success = tester.test_authentication(username, password)
        
        if success:
            logger.info("✅ Authentication test completed successfully!")
            
            # Save screenshot of authenticated page
            tester.save_screenshot('b2sign_authenticated.png')
            
            # If authenticated, try to navigate to estimate page
            try:
                logger.info("🔍 Testing access to estimate page...")
                tester.driver.get('https://b2sign.com/estimate')
                time.sleep(3)
                tester.save_screenshot('b2sign_estimate_page.png')
                
                # Check if we can access the estimate page
                if 'login' not in tester.driver.current_url.lower():
                    logger.info("✅ Successfully accessed estimate page!")
                else:
                    logger.warning("⚠️  Estimate page redirected to login")
                
            except Exception as e:
                logger.error(f"❌ Error testing estimate page: {e}")
            
        else:
            logger.error("❌ Authentication test failed!")
            tester.save_screenshot('b2sign_login_failed.png')
        
        return success
    
    finally:
        tester.close()

if __name__ == "__main__":
    main()
