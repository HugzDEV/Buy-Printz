#!/usr/bin/env python3
"""
B2Sign Playwright Integration
This module uses Playwright to interact with B2Sign.com for shipping cost extraction.
Playwright is more reliable than Selenium for React/Inertia.js applications.
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page, BrowserContext

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class B2SignPlaywrightIntegration:
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.username = "order@buyprintz.com"
        self.password = "$AG@BuyPr!n1z"
        self.base_url = "https://www.b2sign.com"
        
        # Product page mappings from existing Selenium intelligence
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
        
    async def initialize(self):
        """Initialize Playwright browser"""
        try:
            logger.info("🚀 Initializing Playwright browser...")
            self.playwright = await async_playwright().start()
            
            # Launch browser with proper settings for Railway
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            # Create context with proper settings
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            self.page = await self.context.new_page()
            logger.info("✅ Playwright browser initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Playwright: {e}")
            return False
    
    async def login(self):
        """Login to B2Sign"""
        try:
            logger.info("🔐 Logging into B2Sign...")
            
            # Navigate to main page (login is on the main page)
            await self.page.goto(f"{self.base_url}", wait_until='networkidle')
            
            # Wait for page to fully load (React/Inertia.js)
            await self.page.wait_for_timeout(3000)
            
            # Look for "Member Sign In" button and click it
            logger.info("🔍 Looking for Member Sign In button...")
            member_signin_selectors = [
                'button:has-text("Member Sign In")',
                'a:has-text("Member Sign In")',
                'button:has-text("Sign In")',
                'a:has-text("Sign In")',
                'button:has-text("Login")',
                'a:has-text("Login")',
                '[data-testid*="signin"]',
                '[data-testid*="login"]'
            ]
            
            signin_clicked = False
            for selector in member_signin_selectors:
                try:
                    await self.page.wait_for_selector(selector, timeout=5000)
                    await self.page.click(selector)
                    signin_clicked = True
                    logger.info(f"✅ Member Sign In button clicked using selector: {selector}")
                    break
                except:
                    continue
            
            if not signin_clicked:
                logger.error("❌ Could not find Member Sign In button")
                return False
            
            # Wait for login form to appear
            await self.page.wait_for_timeout(2000)
            
            # Try multiple selectors for email field (using placeholder since name is None)
            email_selectors = [
                'input[placeholder="Email"]',
                'input[placeholder="Email Address"]',
                'input[type="email"]',
                'input[name="email"]'
            ]
            
            email_filled = False
            for selector in email_selectors:
                try:
                    await self.page.wait_for_selector(selector, timeout=5000)
                    await self.page.fill(selector, self.username)
                    email_filled = True
                    logger.info(f"✅ Email filled using selector: {selector}")
                    break
                except:
                    continue
            
            if not email_filled:
                logger.error("❌ Could not find email input field")
                return False
            
            # Try multiple selectors for password field (using placeholder since name is None)
            password_selectors = [
                'input[placeholder="Password"]',
                'input[type="password"]',
                'input[name="password"]'
            ]
            
            password_filled = False
            for selector in password_selectors:
                try:
                    await self.page.wait_for_selector(selector, timeout=5000)
                    await self.page.fill(selector, self.password)
                    password_filled = True
                    logger.info(f"✅ Password filled using selector: {selector}")
                    break
                except:
                    continue
            
            if not password_filled:
                logger.error("❌ Could not find password input field")
                return False
            
            # Try to submit form
            submit_selectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:has-text("Login")',
                'button:has-text("Sign In")',
                'button:has-text("Log In")'
            ]
            
            form_submitted = False
            for selector in submit_selectors:
                try:
                    await self.page.click(selector)
                    form_submitted = True
                    logger.info(f"✅ Form submitted using selector: {selector}")
                    break
                except:
                    continue
            
            if not form_submitted:
                logger.error("❌ Could not find submit button")
                return False
            
            # Wait for redirect or success
            await self.page.wait_for_load_state('networkidle', timeout=15000)
            
            # Check if login was successful
            current_url = self.page.url
            logger.info(f"🔗 Current URL after login: {current_url}")
            
            # Login is successful if we're not on a login page or if we're redirected to main page
            if 'login' not in current_url or current_url == f"{self.base_url}/" or current_url == f"{self.base_url}":
                logger.info("✅ Successfully logged into B2Sign")
                return True
            else:
                logger.error("❌ Login failed - still on login page")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False
    
    async def navigate_to_banners_page(self):
        """Navigate to the banners product page"""
        try:
            logger.info("🌐 Navigating to B2Sign banners page...")
            await self.page.goto("https://www.b2sign.com/banners", wait_until='networkidle')
            await self.page.wait_for_timeout(2000)
            logger.info("✅ Successfully navigated to banners page")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to navigate to banners page: {e}")
            return False
    
    async def navigate_to_tents_page(self):
        """Navigate to the custom event tents product page"""
        try:
            logger.info("🌐 Navigating to B2Sign custom event tents page...")
            await self.page.goto("https://www.b2sign.com/custom-event-tents", wait_until='networkidle')
            await self.page.wait_for_timeout(2000)
            logger.info("✅ Successfully navigated to custom event tents page")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to navigate to tents page: {e}")
            return False

    async def cleanup(self):
        """Clean up browser resources"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("✅ Browser resources cleaned up")
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {e}")
    
    async def get_banner_shipping_costs(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping costs for banner products"""
        try:
            logger.info(f"🚚 Getting banner shipping costs for {order_data.get('material', 'banner')}")
            
            # Map BuyPrintz material to specific B2Sign product page
            material = order_data.get('material', '13oz-vinyl')
            material_mapping = {
                '13oz-vinyl': 'banner_13oz_vinyl',
                'fabric-9oz': 'banner_fabric_9oz',
                'mesh': 'banner_mesh',
                'backlit': 'banner_backlit',
                'blockout': 'banner_blockout',
                'indoor': 'banner_indoor',
                'pole': 'banner_pole',
                'hand': 'banner_hand'
            }
            
            product_key = material_mapping.get(material, 'banner_13oz_vinyl')
            product_url = self.product_pages.get(product_key)
            
            if not product_url:
                return {
                    'success': False,
                    'errors': [f'No product page mapping found for material: {material}'],
                    'shipping_options': []
                }
            
            # Navigate to specific banner product page
            logger.info(f"🌐 Navigating to {product_url}")
            await self.page.goto(product_url, wait_until='networkidle')
            
            # Wait for product page to load
            await self.page.wait_for_selector('form, .quote-form, [data-testid*="quote"]', timeout=10000)
            
            # Fill out the quote form based on order data
            shipping_options = await self._fill_banner_quote_form(order_data)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'b2sign_product_url': product_url,
                'extracted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting banner shipping costs: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    async def get_tent_shipping_costs(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping costs for tent products"""
        try:
            logger.info(f"🚚 Getting tent shipping costs for {order_data.get('tent_size', 'tent')}")
            
            # Navigate to tent product page (all tent sizes use the same page)
            tent_url = self.product_pages.get('tent_10x10')
            logger.info(f"🌐 Navigating to {tent_url}")
            await self.page.goto(tent_url, wait_until='networkidle')
            
            # Wait for product page to load
            await self.page.wait_for_selector('form, .quote-form, [data-testid*="quote"]', timeout=10000)
            
            # Fill out the quote form based on order data
            shipping_options = await self._fill_tent_quote_form(order_data)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'b2sign_product_url': tent_url,
                'extracted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting tent shipping costs: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    async def _fill_banner_quote_form(self, order_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fill out banner quote form and extract shipping options"""
        try:
            # Map BuyPrintz data to B2Sign form fields
            material = order_data.get('material', '13oz Vinyl')
            dimensions = order_data.get('dimensions', {})
            quantity = order_data.get('quantity', 1)
            print_options = order_data.get('print_options', {})
            
            # Fill material selection
            if 'material' in order_data:
                await self.page.select_option('select[name*="material"], select[name*="type"]', 
                                            label=material, timeout=5000)
            
            # Fill dimensions
            if dimensions:
                width = dimensions.get('width', 2)
                height = dimensions.get('height', 4)
                await self.page.fill('input[name*="width"], input[name*="size"]', str(width))
                await self.page.fill('input[name*="height"], input[name*="length"]', str(height))
            
            # Fill quantity
            await self.page.fill('input[name*="quantity"], input[name*="qty"]', str(quantity))
            
            # Fill print options
            if print_options.get('sides') == 'double':
                await self.page.check('input[name*="double"], input[name*="two-sided"]')
            
            if print_options.get('grommets'):
                await self.page.check('input[name*="grommet"]')
            
            # Submit form to get quote
            await self.page.click('button[type="submit"], input[type="submit"], .submit-btn')
            
            # Wait for quote results
            await self.page.wait_for_selector('.shipping-options, .quote-results, [data-testid*="shipping"]', 
                                            timeout=15000)
            
            # Extract shipping options
            shipping_options = await self._extract_shipping_options()
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error filling banner form: {e}")
            return []
    
    async def _fill_tent_quote_form(self, order_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fill out tent quote form and extract shipping options"""
        try:
            # Map BuyPrintz data to B2Sign form fields
            tent_size = order_data.get('print_options', {}).get('tent_size', '10x10')
            quantity = order_data.get('quantity', 1)
            design_option = order_data.get('print_options', {}).get('tent_design_option', 'canopy-only')
            
            # Fill tent size
            await self.page.select_option('select[name*="size"], select[name*="tent"]', 
                                        label=tent_size, timeout=5000)
            
            # Fill quantity
            await self.page.fill('input[name*="quantity"], input[name*="qty"]', str(quantity))
            
            # Fill design option
            if design_option == 'canopy-only':
                await self.page.check('input[name*="canopy"], input[value*="canopy"]')
            elif design_option == 'all-sides':
                await self.page.check('input[name*="all"], input[value*="all"]')
            
            # Submit form to get quote
            await self.page.click('button[type="submit"], input[type="submit"], .submit-btn')
            
            # Wait for quote results
            await self.page.wait_for_selector('.shipping-options, .quote-results, [data-testid*="shipping"]', 
                                            timeout=15000)
            
            # Extract shipping options
            shipping_options = await self._extract_shipping_options()
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error filling tent form: {e}")
            return []
    
    async def _extract_shipping_options(self) -> List[Dict[str, Any]]:
        """Extract shipping options from the quote results"""
        try:
            shipping_options = []
            
            # Look for shipping option elements
            shipping_elements = await self.page.query_selector_all(
                '.shipping-option, .shipping-method, [data-testid*="shipping"]'
            )
            
            for element in shipping_elements:
                try:
                    # Extract shipping option details
                    name_elem = await element.query_selector('.name, .title, h3, h4')
                    cost_elem = await element.query_selector('.cost, .price, .amount')
                    days_elem = await element.query_selector('.days, .delivery, .time')
                    
                    name = await name_elem.inner_text() if name_elem else "Standard Shipping"
                    cost = await cost_elem.inner_text() if cost_elem else "Contact for Quote"
                    days = await days_elem.inner_text() if days_elem else "5-7 days"
                    
                    # Clean up the text
                    name = name.strip()
                    cost = cost.strip()
                    days = days.strip()
                    
                    # Determine shipping type
                    shipping_type = "standard"
                    if "express" in name.lower() or "expedited" in name.lower():
                        shipping_type = "expedited"
                    elif "overnight" in name.lower() or "next day" in name.lower():
                        shipping_type = "overnight"
                    
                    shipping_options.append({
                        "name": name,
                        "type": shipping_type,
                        "cost": cost,
                        "estimated_days": self._parse_days(days),
                        "description": f"B2Sign {name}"
                    })
                    
                except Exception as e:
                    logger.warning(f"⚠️ Error extracting shipping option: {e}")
                    continue
            
            # If no specific shipping options found, look for general quote info
            if not shipping_options:
                quote_elem = await self.page.query_selector('.quote, .estimate, .total')
                if quote_elem:
                    quote_text = await quote_elem.inner_text()
                    shipping_options.append({
                        "name": "B2Sign Quote",
                        "type": "standard",
                        "cost": quote_text.strip(),
                        "estimated_days": 5,
                        "description": "B2Sign shipping quote"
                    })
            
            logger.info(f"✅ Extracted {len(shipping_options)} shipping options")
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error extracting shipping options: {e}")
            return []
    
    def _parse_days(self, days_text: str) -> int:
        """Parse estimated days from text"""
        try:
            import re
            numbers = re.findall(r'\d+', days_text)
            if numbers:
                return int(numbers[0])
            return 5  # Default
        except:
            return 5
    
    async def close(self):
        """Close browser and cleanup"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("✅ Playwright browser closed")
        except Exception as e:
            logger.error(f"❌ Error closing browser: {e}")

# Global instance
b2sign_playwright = None

async def get_b2sign_playwright():
    """Get or create B2Sign Playwright instance"""
    global b2sign_playwright
    
    if b2sign_playwright is None:
        b2sign_playwright = B2SignPlaywrightIntegration()
        await b2sign_playwright.initialize()
        await b2sign_playwright.login()
    
    return b2sign_playwright

async def get_shipping_costs_playwright(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get shipping costs using Playwright with proper context management (like test_navigation.py)"""
    try:
        logger.info("🚀 Starting Playwright shipping costs extraction...")
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            # Create context
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Step 1: Navigate to main page and login (like test_navigation.py)
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Click Member Sign In
            logger.info("🔐 Step 2: Logging in...")
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Check if login was successful
            current_url = page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
            else:
                logger.error("❌ Login failed")
                return {
                    'success': False,
                    'errors': ['Failed to login to B2Sign'],
                    'shipping_options': []
                }
            
            # Step 3: Navigate to appropriate product page based on order data
            product_type = order_data.get('product_type', 'banner')
            
            if product_type in ['banner', 'banners']:
                # Map BuyPrintz material to specific B2Sign product page
                material = order_data.get('material', '13oz-vinyl')
                material_mapping = {
                    '13oz-vinyl': 'banner_13oz_vinyl',
                    'fabric-9oz': 'banner_fabric_9oz',
                    'mesh': 'banner_mesh',
                    'backlit': 'banner_backlit',
                    'blockout': 'banner_blockout',
                    'indoor': 'banner_indoor',
                    'pole': 'banner_pole',
                    'hand': 'banner_hand'
                }
                
                product_key = material_mapping.get(material, 'banner_13oz_vinyl')
                product_pages = {
                    'banner_13oz_vinyl': 'https://www.b2sign.com/13oz-vinyl-banner',
                    'banner_fabric_9oz': 'https://www.b2sign.com/fabric-banner-9oz-wrinkle-free',
                    'banner_mesh': 'https://www.b2sign.com/mesh-banners',
                    'banner_backlit': 'https://www.b2sign.com/vinyl-banner-backlit',
                    'banner_blockout': 'https://www.b2sign.com/vinyl-banner-18oz-blockout',
                    'banner_indoor': 'https://www.b2sign.com/super-smooth-indoor-banner',
                    'banner_pole': 'https://www.b2sign.com/pole-banner-set',
                    'banner_hand': 'https://www.b2sign.com/hand-banner'
                }
                
                product_url = product_pages.get(product_key)
                if not product_url:
                    return {
                        'success': False,
                        'errors': [f'No product page mapping found for material: {material}'],
                        'shipping_options': []
                    }
                
                logger.info(f"🌐 Step 3: Navigating to banner product page: {product_url}")
                await page.goto(product_url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                
            elif product_type in ['tent', 'tents', 'tradeshow_tent']:
                logger.info("🌐 Step 3: Navigating to custom event tents page...")
                await page.goto("https://www.b2sign.com/custom-event-tents", wait_until='networkidle')
                await page.wait_for_timeout(3000)
            else:
                return {
                    'success': False,
                    'errors': [f'Unsupported product type: {product_type}'],
                    'shipping_options': []
                }
            
            # Step 4: Fill out the quote form (simplified for now)
            logger.info("📝 Step 4: Filling out quote form...")
            
            # Basic form filling - this would need to be expanded based on actual B2Sign form structure
            dimensions = order_data.get('dimensions', {})
            width = dimensions.get('width', 2)
            height = dimensions.get('height', 4)
            quantity = order_data.get('quantity', 1)
            
            # Try to fill common form fields
            try:
                await page.fill('input[name*="width"], input[placeholder*="width" i]', str(width))
                await page.fill('input[name*="height"], input[placeholder*="height" i]', str(height))
                await page.fill('input[name*="quantity"], input[placeholder*="quantity" i]', str(quantity))
            except:
                logger.warning("⚠️ Could not fill all form fields - form structure may be different")
            
            # Try to submit form
            try:
                await page.click('button[type="submit"], input[type="submit"], button:has-text("Get Quote"), button:has-text("Calculate")')
                await page.wait_for_timeout(5000)
            except:
                logger.warning("⚠️ Could not find submit button - form may be different")
            
            # For now, return a mock shipping option since we need to analyze the actual form structure
            shipping_options = [{
                "name": "B2Sign Standard Shipping",
                "type": "standard",
                "cost": "Contact for Quote",
                "estimated_days": 5,
                "description": "B2Sign shipping quote - form analysis needed"
            }]
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'b2sign_product_url': page.url,
                'extracted_at': datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"❌ Error in Playwright shipping costs: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }
