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
            
            # Navigate to login page
            await self.page.goto(f"{self.base_url}/login", wait_until='networkidle')
            
            # Wait for login form
            await self.page.wait_for_selector('input[name="email"], input[type="email"]', timeout=10000)
            
            # Fill login form
            await self.page.fill('input[name="email"], input[type="email"]', self.username)
            await self.page.fill('input[name="password"], input[type="password"]', self.password)
            
            # Submit form
            await self.page.click('button[type="submit"], input[type="submit"]')
            
            # Wait for redirect or success
            await self.page.wait_for_load_state('networkidle', timeout=15000)
            
            # Check if login was successful
            current_url = self.page.url
            if 'login' not in current_url or 'dashboard' in current_url:
                logger.info("✅ Successfully logged into B2Sign")
                return True
            else:
                logger.error("❌ Login failed - still on login page")
                return False
                
        except Exception as e:
            logger.error(f"❌ Login error: {e}")
            return False
    
    async def get_banner_shipping_costs(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping costs for banner products"""
        try:
            logger.info(f"🚚 Getting banner shipping costs for {order_data.get('material', 'banner')}")
            
            # Navigate to banner product page
            await self.page.goto(f"{self.base_url}/banners", wait_until='networkidle')
            
            # Wait for product page to load
            await self.page.wait_for_selector('form, .quote-form, [data-testid*="quote"]', timeout=10000)
            
            # Fill out the quote form based on order data
            shipping_options = await self._fill_banner_quote_form(order_data)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
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
            
            # Navigate to tent product page
            await self.page.goto(f"{self.base_url}/custom-event-tents", wait_until='networkidle')
            
            # Wait for product page to load
            await self.page.wait_for_selector('form, .quote-form, [data-testid*="quote"]', timeout=10000)
            
            # Fill out the quote form based on order data
            shipping_options = await self._fill_tent_quote_form(order_data)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
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
    """Get shipping costs using Playwright"""
    try:
        playwright_integration = await get_b2sign_playwright()
        
        product_type = order_data.get('product_type', 'banner')
        
        if product_type in ['banner', 'banners']:
            return await playwright_integration.get_banner_shipping_costs(order_data)
        elif product_type in ['tent', 'tents', 'tradeshow_tent']:
            return await playwright_integration.get_tent_shipping_costs(order_data)
        else:
            return {
                'success': False,
                'errors': [f'Unsupported product type: {product_type}'],
                'shipping_options': []
            }
            
    except Exception as e:
        logger.error(f"❌ Error in Playwright shipping costs: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }
