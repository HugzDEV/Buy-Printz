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
                headless=False,
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
        """Login to B2Sign using the exact proven method from test_navigation.py"""
        try:
            logger.info("🔐 Logging into B2Sign using proven method...")
            
            # Navigate to main page (exact method from test_navigation.py)
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            await self.page.goto("https://www.b2sign.com", wait_until='networkidle')
            await self.page.wait_for_timeout(3000)
            
            # Click Member Sign In (exact method from test_navigation.py)
            logger.info("🔐 Step 2: Logging in...")
            await self.page.click('button:has-text("Member Sign In")')
            await self.page.wait_for_timeout(2000)
            
            # Fill login form (exact method from test_navigation.py)
            await self.page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await self.page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await self.page.click('button[type="submit"]')
            await self.page.wait_for_timeout(5000)
            
            # Check if login was successful (exact method from test_navigation.py)
            current_url = self.page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
                return True
            else:
                logger.error("❌ Login failed")
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
            await self.page.wait_for_timeout(3000)
            
            # Use the complete proven banner workflow
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
        """Fill out banner quote form using the complete proven workflow"""
        try:
            logger.info("🎨 Starting complete banner workflow...")
            
            # Extract order specifications
            dimensions = order_data.get('dimensions', {})
            width = dimensions.get('width', 3)
            height = dimensions.get('height', 6)
            quantity = order_data.get('quantity', 1)
            print_options = order_data.get('print_options', {})
            customer_info = order_data.get('customer_info', {})
            zip_code = customer_info.get('zipCode', customer_info.get('zip_code', '90210'))
            
            logger.info(f"📋 Banner specs: {width}x{height}, qty: {quantity}, zip: {zip_code}")
            
            # Step 1: Fill dimensions using MUI selectors
            await self._fill_banner_dimensions(width, height)
            
            # Step 2: Fill job details
            await self._fill_banner_job_details(width, height, quantity)
            
            # Step 3: Fill banner options (2 Sides, No Pole Pockets, etc.)
            await self._fill_banner_options_workflow(print_options)
            
            # Step 4: Select Blind Drop Ship
            await self._select_blind_drop_ship()
            
            # Step 5: Open address modal and fill customer address
            await self._open_and_fill_address_modal(zip_code, customer_info)
            
            # Step 6: Extract all shipping options
            shipping_options = await self._extract_all_shipping_options_workflow()
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error in complete banner workflow: {e}")
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
    
    async def _create_mock_order_and_get_shipping(self, page, product_type, dimensions, quantity, print_options, accessories, zip_code):
        """Create a mock order on B2Sign and extract the calculated shipping cost"""
        try:
            logger.info("🛒 Creating mock order on B2Sign...")
            
            # Fill dimensions
            width = dimensions.get('width', 2)
            height = dimensions.get('height', 4)
            
            # Fill dimensions in feet and inches format
            await self._fill_dimensions(page, width, height)
            
            # Fill job details
            await self._fill_job_details(page, product_type, width, height, quantity)
            
            # Handle product-specific options first
            if product_type in ['banner', 'banners']:
                await self._fill_banner_options(page, print_options, accessories)
            elif product_type in ['tent', 'tents', 'tradeshow_tent']:
                await self._fill_tent_options(page, print_options, accessories)
            
            # Wait for shipping section to appear after filling form
            logger.info("⏳ Waiting for shipping section to appear...")
            await page.wait_for_timeout(3000)
            
            # Set shipping to Blind Drop Ship (this triggers shipping options to appear)
            await self._set_shipping_options(page, zip_code)
            
            # Wait for shipping options to appear after Blind Drop Ship is selected
            logger.info("⏳ Waiting for shipping options dropdown to appear...")
            await page.wait_for_timeout(5000)
            
            # Look for the shipping method dropdown (should show "Ground $14.04" initially)
            shipping_dropdown = None
            dropdown_selectors = [
                'button:has-text("Ground")',
                'button:has-text("$")',
                '.MuiSelect-button',
                'button[class*="select"]',
                'button[role="button"]'
            ]
            
            for selector in dropdown_selectors:
                try:
                    dropdown = await page.query_selector(selector)
                    if dropdown:
                        dropdown_text = await dropdown.inner_text()
                        if '$' in dropdown_text and ('ground' in dropdown_text.lower() or 'shipping' in dropdown_text.lower()):
                            shipping_dropdown = dropdown
                            logger.info(f"✅ Found shipping dropdown: {dropdown_text}")
                            break
                except:
                    continue
            
            if shipping_dropdown:
                # Click the dropdown to reveal all 7 options
                await shipping_dropdown.click()
                logger.info("✅ Clicked shipping dropdown to reveal all options")
                await page.wait_for_timeout(2000)
            
            # Extract all available shipping options
            shipping_options = await self._extract_all_shipping_options(page)
            
            if shipping_options:
                logger.info(f"✅ Extracted {len(shipping_options)} shipping options")
                return shipping_options
            else:
                logger.warning("⚠️ Could not extract shipping options from order")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error creating mock order: {e}")
            return None
    
    async def _fill_dimensions(self, page, width, height):
        """Fill width and height in feet and inches format"""
        try:
            logger.info(f"📏 Filling dimensions: {width}ft x {height}ft")
            
            # Convert to feet and inches
            width_ft = int(width)
            width_in = int((width - width_ft) * 12) if width > width_ft else 0
            
            height_ft = int(height)
            height_in = int((height - height_ft) * 12) if height > height_ft else 0
            
            # Use exact MUI selectors from page analysis
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            logger.info(f"Found {len(mui_inputs)} MUI input fields for dimensions")
            
            # Fill dimension inputs using MUI selectors (skip login inputs at index 0-1)
            width_filled = False
            for i, input_elem in enumerate(mui_inputs[2:6]):  # Skip login inputs, use dimension inputs
                try:
                    # Try to fill width in feet
                    if i == 0:
                        await input_elem.fill(str(width_ft))
                        logger.info(f"✅ Filled width feet: {width_ft}")
                    # Try to fill width in inches
                    elif i == 1:
                        await input_elem.fill(str(width_in))
                        logger.info(f"✅ Filled width inches: {width_in}")
                        width_filled = True
                        break
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill width input {i}: {e}")
                    continue
            
            # Look for height inputs (should be next two inputs)
            height_filled = False
            for i, input_elem in enumerate(mui_inputs[2:6]):  # Check mui_inputs 2-5
                try:
                    # Try to fill height in feet
                    if i == 0:
                        await input_elem.fill(str(height_ft))
                        logger.info(f"✅ Filled height feet: {height_ft}")
                    # Try to fill height in inches
                    elif i == 1:
                        await input_elem.fill(str(height_in))
                        logger.info(f"✅ Filled height inches: {height_in}")
                        height_filled = True
                        break
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill height input {i}: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error filling dimensions: {e}")
    
    async def _fill_job_details(self, page, product_type, width, height, quantity):
        """Fill job name and quantity"""
        try:
            logger.info("📝 Filling job details...")
            
            # Fill job name
            job_name_input = await page.query_selector('input[placeholder*="Job Name"]')
            if job_name_input:
                job_name = f"BuyPrintz-{product_type}-{width}x{height}"
                await job_name_input.fill(job_name)
                logger.info(f"✅ Filled job name: {job_name}")
            
            # Fill quantity
            inputs = await page.query_selector_all('input')
            for input_elem in inputs:
                try:
                    placeholder = await input_elem.get_attribute('placeholder')
                    if placeholder and 'qty' in placeholder.lower():
                        await input_elem.fill(str(quantity))
                        logger.info(f"✅ Filled quantity: {quantity}")
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error filling job details: {e}")
    
    async def _set_shipping_options(self, page, zip_code):
        """Set shipping to Blind Drop Ship and configure customer address"""
        try:
            logger.info("🚚 Setting up shipping workflow...")
            
            # Step 1: Select "Blind Drop Ship" radio button
            blind_drop_selected = False
            
            # Look for MUI radio buttons in the shipping section
            # Try different MUI radio button selectors
            radio_selectors = [
                'input[type="radio"]',
                '.MuiRadio-input',
                '.MuiRadio-root input',
                '[role="radio"]',
                'input[name*="shipping"]',
                'input[name*="ship"]'
            ]
            
            radio_buttons = []
            for selector in radio_selectors:
                buttons = await page.query_selector_all(selector)
                radio_buttons.extend(buttons)
                if buttons:
                    logger.info(f"Found {len(buttons)} radio buttons with selector: {selector}")
            
            # Remove duplicates
            radio_buttons = list(set(radio_buttons))
            logger.info(f"Total unique radio buttons found: {len(radio_buttons)}")
            
            for radio in radio_buttons:
                try:
                    # Look for text in MUI radio button structure
                    # Try different ways to find the associated text
                    text_found = False
                    
                    # Method 1: Check parent element
                    parent = await radio.query_selector('xpath=..')
                    if parent:
                        text = await parent.inner_text()
                        if text.strip():
                            logger.info(f"Checking radio button with parent text: '{text.strip()}'")
                            if 'blind drop' in text.lower():
                                await radio.click()
                                logger.info("✅ Selected Blind Drop Ship radio button (parent text)")
                                blind_drop_selected = True
                                text_found = True
                                await page.wait_for_timeout(2000)
                                break
                    
                    # Method 2: Check grandparent element
                    if not text_found and parent:
                        grandparent = await parent.query_selector('xpath=..')
                        if grandparent:
                            text = await grandparent.inner_text()
                            if text.strip():
                                logger.info(f"Checking radio button with grandparent text: '{text.strip()}'")
                                if 'blind drop' in text.lower():
                                    await radio.click()
                                    logger.info("✅ Selected Blind Drop Ship radio button (grandparent text)")
                                    blind_drop_selected = True
                                    text_found = True
                                    await page.wait_for_timeout(2000)
                                    break
                    
                    # Method 3: Look for sibling elements with text
                    if not text_found and parent:
                        siblings = await parent.query_selector_all('*')
                        for sibling in siblings:
                            try:
                                text = await sibling.inner_text()
                                if text.strip() and 'blind drop' in text.lower():
                                    await radio.click()
                                    logger.info("✅ Selected Blind Drop Ship radio button (sibling text)")
                                    blind_drop_selected = True
                                    text_found = True
                                    await page.wait_for_timeout(2000)
                                    break
                            except:
                                continue
                        if text_found:
                            break
                            
                except:
                    continue
            
            # If still not found, try clicking by text content
            if not blind_drop_selected:
                logger.info("Trying to find Blind Drop Ship by text content...")
                try:
                    # Try different text selectors
                    text_selectors = [
                        'text="Blind Drop Ship"',
                        'text*="Blind Drop"',
                        'text*="blind drop"',
                        '[data-testid*="blind"]',
                        '[aria-label*="blind"]'
                    ]
                    
                    for selector in text_selectors:
                        try:
                            element = await page.query_selector(selector)
                            if element:
                                await element.click()
                                logger.info(f"✅ Clicked Blind Drop Ship with selector: {selector}")
                                blind_drop_selected = True
                                await page.wait_for_timeout(2000)
                                break
                        except:
                            continue
                    
                    # If still not found, try clicking on any element containing the text
                    if not blind_drop_selected:
                        all_elements = await page.query_selector_all('*')
                        for element in all_elements:
                            try:
                                text = await element.inner_text()
                                if 'blind drop' in text.lower() and 'ship' in text.lower():
                                    await element.click()
                                    logger.info("✅ Clicked Blind Drop Ship by element text")
                                    blind_drop_selected = True
                                    await page.wait_for_timeout(2000)
                                    break
                            except:
                                continue
                except:
                    pass
            
            if not blind_drop_selected:
                logger.warning("⚠️ Could not find Blind Drop Ship radio button")
                logger.info("Available radio button texts:")
                for radio in radio_buttons:
                    try:
                        parent = await radio.query_selector('xpath=..')
                        if parent:
                            text = await parent.inner_text()
                            logger.info(f"  - '{text.strip()}'")
                    except:
                        pass
                return
            
            # Step 2: Wait for shipping section to appear and find pencil edit button
            logger.info("📝 Looking for Ship to edit button (pencil icon)...")
            modal_opened = False
            
            # Wait for shipping section to appear after Blind Drop Ship selection
            await page.wait_for_timeout(3000)
            
            # Look for pencil icon in Ship to section - try multiple approaches
            edit_button_selectors = [
                'button[aria-label*="edit"]',
                'button[title*="edit"]',
                'button[class*="edit"]',
                'button svg',
                '[role="button"] svg',
                'button[class*="MuiIconButton"]',
                'button[class*="icon"]'
            ]
            
            for selector in edit_button_selectors:
                try:
                    buttons = await page.query_selector_all(selector)
                    for button in buttons:
                        try:
                            # Check if this button is in the Ship to section
                            parent = await button.query_selector('xpath=..')
                            if parent:
                                parent_text = await parent.inner_text()
                                # Look for buttons near "Ship to" text
                                if 'ship to' in parent_text.lower():
                                    await button.click()
                                    logger.info("✅ Clicked Ship to edit button (pencil icon)")
                                    modal_opened = True
                                    await page.wait_for_timeout(2000)
                                    break
                        except:
                            continue
                    if modal_opened:
                        break
                except:
                    continue
            
            # Fallback: Look for any button with empty text near "Ship to"
            if not modal_opened:
                try:
                    buttons = await page.query_selector_all('button')
                    for button in buttons:
                        try:
                            button_text = await button.inner_text()
                            if button_text.strip() == '':  # Empty button (likely an icon)
                                parent = await button.query_selector('xpath=..')
                                if parent:
                                    parent_text = await parent.inner_text()
                                    if 'ship to' in parent_text.lower():
                                        await button.click()
                                        logger.info("✅ Clicked Ship to edit button (empty button)")
                                        modal_opened = True
                                        await page.wait_for_timeout(2000)
                                        break
                        except:
                            continue
                except:
                    pass
            
            if not modal_opened:
                logger.warning("⚠️ Could not find Ship to edit button (pencil icon)")
                return
            
            # Step 3: Fill customer address in the modal
            logger.info("📝 Filling customer address in modal...")
            await self._fill_customer_address_modal(page, zip_code, customer_info)
            
            # Step 4: Click "Use this address" button
            logger.info("✅ Clicking Use this address button...")
            use_address_clicked = False
            
            modal_buttons = await page.query_selector_all('button')
            for modal_button in modal_buttons:
                try:
                    modal_button_text = await modal_button.inner_text()
                    if 'use this address' in modal_button_text.lower():
                        await modal_button.click()
                        logger.info("✅ Clicked Use this address button")
                        use_address_clicked = True
                        await page.wait_for_timeout(3000)  # Wait for modal to close and shipping options to appear
                        break
                except:
                    continue
            
            if not use_address_clicked:
                logger.warning("⚠️ Could not find Use this address button")
                    
        except Exception as e:
            logger.warning(f"⚠️ Error setting shipping options: {e}")
    
    async def _fill_customer_address_modal(self, page, zip_code, customer_info=None):
        """Fill customer address information in the modal using proven selectors"""
        try:
            logger.info("📝 Filling customer address modal...")
            
            # Use customer info if provided, otherwise use defaults
            if customer_info:
                name = customer_info.get('name', 'John Doe')
                company = customer_info.get('company', 'BuyPrintz Inc')
                phone = customer_info.get('phone', '555-123-4567')
                address = customer_info.get('address', '123 Main St')
                city = customer_info.get('city', 'Beverly Hills')
                state = customer_info.get('state', 'CA')
            else:
                name = 'John Doe'
                company = 'BuyPrintz Inc'
                phone = '555-123-4567'
                address = '123 Main St'
                city = 'Beverly Hills'
                state = 'CA'
            
            # Fill address fields using exact selectors from proven workflow
            address_fields = [
                ('input[name="fullname"]', name),
                ('input[name="company"]', company),
                ('input[name="telephone"]', phone),
                ('input[placeholder="Street address"]', address),
                ('input[name="suburb"]', ''),
                ('input[name="city"]', city),
                ('input[name="postcode"]', str(zip_code))
            ]
            
            for selector, value in address_fields:
                try:
                    field = await page.query_selector(selector)
                    if field:
                        # Get field attributes to verify we're filling the right field
                        field_placeholder = await field.get_attribute('placeholder') or ''
                        field_name = await field.get_attribute('name') or ''
                        
                        logger.info(f"🔍 Filling field: {selector}")
                        logger.info(f"  - Placeholder: '{field_placeholder}'")
                        logger.info(f"  - Name: '{field_name}'")
                        logger.info(f"  - Value: '{value}'")
                        
                        await field.fill(value)
                        logger.info(f"✅ Filled {selector}: {value}")
                    else:
                        logger.warning(f"⚠️ Field not found: {selector}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill {selector}: {e}")
                    continue
            
            # Handle state - HANDLE HIDDEN STATE DROPDOWN
            try:
                logger.info("🔍 Selecting state - handling hidden state dropdown...")
                
                # First, try to find the hidden state select element
                hidden_state_select = await page.query_selector('select[name="state"]')
                if hidden_state_select:
                    logger.info("✅ Found hidden state select element")
                    try:
                        # Try to make the element visible and select the customer's state
                        await page.evaluate('''(element) => {
                            element.style.display = 'block';
                            element.style.visibility = 'visible';
                            element.disabled = false;
                        }''', hidden_state_select)
                        
                        await page.wait_for_timeout(1000)
                        await hidden_state_select.select_option(state)
                        logger.info(f"✅ Selected {state} state using hidden select")
                        state_selected = True
                    except Exception as e:
                        logger.warning(f"Could not select {state} from hidden select: {e}")
                        # Try JavaScript approach as fallback
                        try:
                            # Try multiple JavaScript approaches
                            await page.evaluate(f'''(element) => {{
                                element.value = '{state}';
                                element.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                element.dispatchEvent(new Event('input', {{ bubbles: true }}));
                            }}''', hidden_state_select)
                            
                            # Also try setting the selectedIndex
                            await page.evaluate(f'''(element) => {{
                                for (let i = 0; i < element.options.length; i++) {{
                                    if (element.options[i].value === '{state}' || element.options[i].text.toLowerCase().includes('{state.lower()}')) {{
                                        element.selectedIndex = i;
                                        break;
                                    }}
                                }}
                                element.dispatchEvent(new Event('change', {{ bubbles: true }}));
                            }}''', hidden_state_select)
                            
                            logger.info(f"✅ Set {state} state using JavaScript")
                            state_selected = True
                        except Exception as e2:
                            logger.warning(f"JavaScript approach also failed: {e2}")
                
                # If hidden select didn't work, try MuiAutocomplete approach
                if not state_selected:
                    logger.info("Trying MuiAutocomplete approach...")
                    
                    autocomplete_selectors = [
                        '.MuiAutocomplete-root',
                        '.MuiAutocomplete-root[class*="hasPopupIcon"]',
                        '.MuiAutocomplete-root[class*="hasClearIcon"]'
                    ]
                    
                    for selector in autocomplete_selectors:
                        try:
                            autocomplete_elements = await page.query_selector_all(selector)
                            for i, element in enumerate(autocomplete_elements):
                                input_field = await element.query_selector('input')
                                if input_field:
                                    # Check if this is the state field by looking at parent context
                                    parent = await element.query_selector('xpath=..')
                                    parent_text = await parent.inner_text() if parent else ""
                                    
                                    # Only proceed if this looks like a state field
                                    if 'state' in parent_text.lower() or 'province' in parent_text.lower():
                                        logger.info("✅ This appears to be the state field")
                                        
                                        await element.click()
                                        await page.wait_for_timeout(1000)
                                        await input_field.fill(state)
                                        await page.wait_for_timeout(1000)
                                        
                                        state_options = await page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                                        for option in state_options:
                                            try:
                                                option_text = await option.inner_text()
                                                if state.lower() in option_text.lower() or any(state_name in option_text.lower() for state_name in self._get_state_names(state)):
                                                    await option.click()
                                                    logger.info(f"✅ Selected state: {state} (using autocomplete {i+1})")
                                                    state_selected = True
                                                    break
                                            except:
                                                continue
                                        
                                        if state_selected:
                                            break
                                    else:
                                        logger.info("⚠️ Skipping - doesn't appear to be state field")
                                        continue
                            
                            if state_selected:
                                break
                                
                        except Exception as e:
                            logger.warning(f"⚠️ Error with autocomplete selector {selector}: {e}")
                            continue
                
                if not state_selected:
                    logger.warning("⚠️ Could not select state using any method")
                    
            except Exception as e:
                logger.warning(f"⚠️ Could not select state: {e}")
                pass
                
        except Exception as e:
            logger.warning(f"⚠️ Error filling customer address modal: {e}")
    
    def _get_state_names(self, state_code):
        """Get possible state names for a given state code"""
        state_mapping = {
            'CA': ['california'],
            'NY': ['new york'],
            'TX': ['texas'],
            'FL': ['florida'],
            'IL': ['illinois'],
            'PA': ['pennsylvania'],
            'OH': ['ohio'],
            'GA': ['georgia'],
            'NC': ['north carolina'],
            'MI': ['michigan'],
            'NJ': ['new jersey'],
            'VA': ['virginia'],
            'WA': ['washington'],
            'AZ': ['arizona'],
            'MA': ['massachusetts'],
            'TN': ['tennessee'],
            'IN': ['indiana'],
            'MO': ['missouri'],
            'MD': ['maryland'],
            'WI': ['wisconsin'],
            'CO': ['colorado'],
            'MN': ['minnesota'],
            'SC': ['south carolina'],
            'AL': ['alabama'],
            'LA': ['louisiana'],
            'KY': ['kentucky'],
            'OR': ['oregon'],
            'OK': ['oklahoma'],
            'CT': ['connecticut'],
            'UT': ['utah'],
            'IA': ['iowa'],
            'NV': ['nevada'],
            'AR': ['arkansas'],
            'MS': ['mississippi'],
            'KS': ['kansas'],
            'NM': ['new mexico'],
            'NE': ['nebraska'],
            'WV': ['west virginia'],
            'ID': ['idaho'],
            'HI': ['hawaii'],
            'NH': ['new hampshire'],
            'ME': ['maine'],
            'RI': ['rhode island'],
            'MT': ['montana'],
            'DE': ['delaware'],
            'SD': ['south dakota'],
            'ND': ['north dakota'],
            'AK': ['alaska'],
            'VT': ['vermont'],
            'WY': ['wyoming']
        }
        return state_mapping.get(state_code.upper(), [state_code.lower()])

    async def _fill_banner_dimensions(self, width, height):
        """Fill banner dimensions using improved precision field detection"""
        try:
            logger.info(f"📏 Filling banner dimensions: {width}ft x {height}ft")
            
            # Convert to feet and inches
            width_ft = int(width)
            width_in = int((width - width_ft) * 12) if width > width_ft else 0
            
            height_ft = int(height)
            height_in = int((height - height_ft) * 12) if height > height_ft else 0
            
            # Look for MUI input fields for dimensions
            mui_inputs = await self.page.query_selector_all('.MuiInput-input')
            logger.info(f"Found {len(mui_inputs)} MUI input fields total")
            
            # Look for dimension-specific input fields - BE MORE SPECIFIC
            dimension_inputs = []
            
            # Method 1: Look for inputs with specific attributes that suggest dimensions
            all_inputs = await self.page.query_selector_all('input')
            logger.info(f"🔍 Found {len(all_inputs)} total input elements")
            
            for i, input_elem in enumerate(all_inputs):
                try:
                    # Check if this input is visible and editable
                    is_visible = await input_elem.is_visible()
                    is_editable = await input_elem.is_editable()
                    
                    if is_visible and is_editable:
                        # Get input attributes
                        placeholder = await input_elem.get_attribute('placeholder') or ''
                        name = await input_elem.get_attribute('name') or ''
                        input_type = await input_elem.get_attribute('type') or ''
                        value = await input_elem.get_attribute('value') or ''
                        
                        # Look for dimension-related attributes
                        if (input_type in ['number', 'text'] and 
                            (any(keyword in (placeholder + name + value).lower() for keyword in ['width', 'height', 'feet', 'inches', 'dimension']) or
                             placeholder == '' or value == '0')):
                            
                            dimension_inputs.append(input_elem)
                            logger.info(f"🔍 Found potential dimension input {len(dimension_inputs)}: placeholder='{placeholder}', name='{name}', type='{input_type}', value='{value}'")
                            
                            # Stop when we have 4 dimension inputs
                            if len(dimension_inputs) >= 4:
                                break
                except Exception as e:
                    logger.warning(f"  Error checking input {i}: {e}")
                    continue
            
            # Method 2: If we didn't find enough, use the MUI inputs approach with better filtering
            if len(dimension_inputs) < 4:
                logger.info("🔍 Using MUI inputs approach for dimensions...")
                # Look for MUI inputs that are visible and editable
                for input_elem in mui_inputs:
                    try:
                        is_visible = await input_elem.is_visible()
                        is_editable = await input_elem.is_editable()
                        
                        if is_visible and is_editable and input_elem not in dimension_inputs:
                            dimension_inputs.append(input_elem)
                            logger.info(f"🔍 Added MUI input {len(dimension_inputs)} to dimensions")
                            
                            if len(dimension_inputs) >= 4:
                                break
                    except:
                        continue
            
            logger.info(f"🔍 Using {len(dimension_inputs)} inputs for dimensions")
            
            # Fill the 4 dimension fields: width_ft, width_in, height_ft, height_in
            dimension_values = [str(width_ft), str(width_in), str(height_ft), str(height_in)]
            dimension_names = ['width feet', 'width inches', 'height feet', 'height inches']
            
            for i, (input_elem, value, name) in enumerate(zip(dimension_inputs, dimension_values, dimension_names)):
                try:
                    await input_elem.fill(value)
                    logger.info(f"✅ Filled {name}: {value}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill {name}: {e}")
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error filling banner dimensions: {e}")
    
    async def _fill_banner_job_details(self, width, height, quantity):
        """Fill job name and quantity"""
        try:
            logger.info("📝 Filling banner job details...")
            
            # Fill job name
            job_name_input = await self.page.query_selector('input[placeholder*="Job Name"]')
            if job_name_input:
                job_name = f"BuyPrintz-Banner-{width}x{height}"
                await job_name_input.fill(job_name)
                logger.info(f"✅ Filled job name: {job_name}")
            
            # Fill quantity
            inputs = await self.page.query_selector_all('input')
            for input_elem in inputs:
                try:
                    placeholder = await input_elem.get_attribute('placeholder')
                    if placeholder and 'qty' in placeholder.lower():
                        await input_elem.fill(str(quantity))
                        logger.info(f"✅ Filled quantity: {quantity}")
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error filling banner job details: {e}")
    
    async def _fill_banner_options_workflow(self, print_options):
        """Fill banner options using proven workflow"""
        try:
            logger.info("🎨 Filling banner options...")
            
            # Select 2 Sides (proven workflow)
            dropdowns = await self.page.query_selector_all('.MuiSelect-button')
            if len(dropdowns) > 0:
                await dropdowns[0].click()
                await self.page.wait_for_timeout(1000)
                two_sides_option = await self.page.query_selector('text="2 Sides"')
                if two_sides_option:
                    await two_sides_option.click()
                    logger.info("✅ Selected dropdown option: 2 Sides")
                    await self.page.wait_for_timeout(2000)
                        
        except Exception as e:
            logger.warning(f"⚠️ Error filling banner options: {e}")
    
    async def _select_blind_drop_ship(self):
        """Select Blind Drop Ship using proven workflow"""
        try:
            logger.info("🚚 Selecting Blind Drop Ship...")
            
            # Use proven method from test_complete_banner_workflow.py
            all_elements = await self.page.query_selector_all('*')
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if 'blind drop' in text.lower() and 'ship' in text.lower():
                        await element.click()
                        logger.info("✅ Clicked Blind Drop Ship")
                        await self.page.wait_for_timeout(3000)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error selecting Blind Drop Ship: {e}")
    
    async def _open_and_fill_address_modal(self, zip_code, customer_info=None):
        """Open address modal and fill customer address using proven workflow"""
        try:
            logger.info("📝 Opening and filling address modal...")
            
            # Step 1: Click pencil icon to open modal
            svgs = await self.page.query_selector_all('svg')
            for i, svg in enumerate(svgs):
                try:
                    parent = await svg.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    if 'ship to different location' in parent_text.lower():
                        await svg.click()
                        logger.info("✅ Clicked pencil icon to open modal")
                        await self.page.wait_for_timeout(2000)
                        break
                except:
                    continue
            
            # Step 2: Fill address fields using exact selectors
            address_fields = [
                ('input[name="fullname"]', 'John Doe'),
                ('input[name="company"]', 'BuyPrintz Inc'),
                ('input[name="telephone"]', '555-123-4567'),
                ('input[placeholder="Street address"]', '123 Main St'),
                ('input[name="suburb"]', 'Suite 100'),
                ('input[name="city"]', 'Beverly Hills'),
                ('input[name="postcode"]', str(zip_code))
            ]
            
            for selector, value in address_fields:
                try:
                    field = await self.page.query_selector(selector)
                    if field:
                        await field.fill(value)
                        logger.info(f"✅ Filled {selector}: {value}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill {selector}: {e}")
                    continue
            
            # Step 3: Select state using MuiAutocomplete
            try:
                autocomplete_selectors = [
                    '.MuiAutocomplete-root',
                    '.MuiAutocomplete-root[class*="hasPopupIcon"]',
                    '.MuiAutocomplete-root[class*="hasClearIcon"]'
                ]
                
                state_selected = False
                for selector in autocomplete_selectors:
                    try:
                        autocomplete_elements = await self.page.query_selector_all(selector)
                        for i, element in enumerate(autocomplete_elements):
                            input_field = await element.query_selector('input')
                            if input_field:
                                await element.click()
                                await self.page.wait_for_timeout(1000)
                                await input_field.fill('CA')
                                await self.page.wait_for_timeout(1000)
                                
                                ca_options = await self.page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                                for option in ca_options:
                                    try:
                                        option_text = await option.inner_text()
                                        if 'california' in option_text.lower() or 'ca' in option_text.lower():
                                            await option.click()
                                            logger.info(f"✅ Selected state: CA (using autocomplete {i+1})")
                                            state_selected = True
                                            break
                                    except:
                                        continue
                                
                                if state_selected:
                                    break
                        
                        if state_selected:
                            break
                            
                    except Exception as e:
                        logger.warning(f"⚠️ Error with autocomplete selector {selector}: {e}")
                        continue
                
                if not state_selected:
                    logger.warning("⚠️ Could not select state using autocomplete")
                    
            except Exception as e:
                logger.warning(f"⚠️ Could not select state: {e}")
                pass
            
            # Step 4: Click "Use this address" button
            try:
                use_button = await self.page.query_selector('button:has-text("Use this address")')
                if use_button:
                    await use_button.click()
                    logger.info("✅ Clicked 'Use this address' button")
                    await self.page.wait_for_timeout(3000)
                else:
                    logger.warning("⚠️ Could not find 'Use this address' button")
            except Exception as e:
                logger.warning(f"⚠️ Could not click 'Use this address' button: {e}")
                pass
                
        except Exception as e:
            logger.warning(f"⚠️ Error opening and filling address modal: {e}")
    
    async def _extract_all_shipping_options_workflow(self):
        """Extract all shipping options using proven workflow"""
        try:
            logger.info("🚚 Extracting all shipping options...")
            
            # Wait for shipping dropdown to appear
            await self.page.wait_for_timeout(3000)
            
            # Look for shipping method dropdown
            shipping_dropdown = None
            dropdown_selectors = [
                'button:has-text("Ground")',
                'button:has-text("$")',
                '.MuiSelect-button',
                'button[class*="select"]',
                'button[role="button"]'
            ]
            
            for selector in dropdown_selectors:
                try:
                    dropdown = await self.page.query_selector(selector)
                    if dropdown:
                        dropdown_text = await dropdown.inner_text()
                        if '$' in dropdown_text and ('ground' in dropdown_text.lower() or 'shipping' in dropdown_text.lower()):
                            shipping_dropdown = dropdown
                            logger.info(f"✅ Found shipping dropdown: {dropdown_text}")
                            break
                except:
                    continue
            
            if shipping_dropdown:
                # Click the dropdown to reveal all options
                await shipping_dropdown.click()
                logger.info("✅ Clicked shipping dropdown to reveal all options")
                await self.page.wait_for_timeout(2000)
                
                # Extract all shipping options
                shipping_options = []
                option_selectors = [
                    '.MuiOption-root',
                    '[role="option"]',
                    'li[role="option"]',
                    '.MuiSelect-listbox li'
                ]
                
                for selector in option_selectors:
                    try:
                        options = await self.page.query_selector_all(selector)
                        if options:
                            logger.info(f"🔍 Found {len(options)} options with selector: {selector}")
                            
                            for i, option in enumerate(options):
                                try:
                                    option_text = await option.inner_text()
                                    if option_text.strip() and '$' in option_text:
                                        parsed_option = self._parse_shipping_option_text(option_text)
                                        if parsed_option:
                                            shipping_options.append(parsed_option)
                                            logger.info(f"  Option {i+1}: {option_text.strip()}")
                                except:
                                    continue
                            
                            if shipping_options:
                                break
                    except:
                        continue
                
                if shipping_options:
                    logger.info(f"🎉 SUCCESS! Found {len(shipping_options)} shipping options")
                    return shipping_options
                else:
                    logger.warning("❌ No shipping options found in dropdown")
                    return []
            else:
                logger.warning("❌ Could not find shipping dropdown")
                return []
                
        except Exception as e:
            logger.warning(f"⚠️ Error extracting shipping options: {e}")
            return []

    async def _fill_banner_options(self, page, print_options, accessories):
        """Fill banner-specific options on B2Sign form using MUI selectors"""
        try:
            logger.info("🎨 Filling banner options...")
            
            # Handle number of sides dropdown
            sides = print_options.get('sides', 1)
            await self._select_dropdown_option(page, f"{sides} Side" if sides == 1 else f"{sides} Sides")
            
            # Handle pole pockets dropdown
            pole_pockets = print_options.get('pole_pockets', 'No Pole Pockets')
            await self._select_dropdown_option(page, pole_pockets)
            
            # Handle hem dropdown
            hem = print_options.get('hem', 'All Sides')
            await self._select_dropdown_option(page, hem)
            
            # Handle grommet dropdown
            grommets = print_options.get('grommets', 'Every 2\' All Sides')
            await self._select_dropdown_option(page, grommets)
            
            # Select turnaround time (default to Next Day for free shipping)
            await self._select_turnaround(page, 'Next Day')
                        
        except Exception as e:
            logger.warning(f"⚠️ Error filling banner options: {e}")
    
    async def _select_dropdown_option(self, page, option_text):
        """Select an option from a dropdown by text"""
        try:
            # Use exact MUI selector from page analysis
            dropdowns = await page.query_selector_all('.MuiSelect-button')
            
            for dropdown in dropdowns:
                try:
                    # Try to click the dropdown to open it
                    await dropdown.click()
                    await page.wait_for_timeout(1000)
                    
                    # Look for the option in the dropdown
                    options = await page.query_selector_all('option, [role="option"], .MuiMenuItem-root')
                    for option in options:
                        try:
                            option_text_content = await option.inner_text()
                            if option_text.lower() in option_text_content.lower():
                                await option.click()
                                logger.info(f"✅ Selected dropdown option: {option_text}")
                                await page.wait_for_timeout(1000)
                                return True
                        except:
                            continue
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Could not select dropdown option '{option_text}': {e}")
            return False
    
    async def _handle_more_options(self, page, accessories):
        """Handle more options button and accessories"""
        try:
            # Look for "MORE OPTIONS" button
            buttons = await page.query_selector_all('button')
            for button in buttons:
                try:
                    button_text = await button.inner_text()
                    if 'more options' in button_text.lower():
                        await button.click()
                        logger.info("✅ Clicked MORE OPTIONS button")
                        await page.wait_for_timeout(2000)
                        break
                except:
                    continue
            
            # Handle accessories in the expanded options
            for accessory in accessories:
                await self._select_dropdown_option(page, accessory)
                
        except Exception as e:
            logger.warning(f"⚠️ Error handling more options: {e}")
    
    async def _select_turnaround(self, page, turnaround_type):
        """Select turnaround time (Next Day or Same Day)"""
        try:
            radio_buttons = await page.query_selector_all('input[type="radio"]')
            for radio in radio_buttons:
                try:
                    # Look for radio button near turnaround text
                    parent = await radio.query_selector('xpath=..')
                    if parent:
                        text = await parent.inner_text()
                        if turnaround_type.lower() in text.lower():
                            await radio.click()
                            logger.info(f"✅ Selected turnaround: {turnaround_type}")
                            break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Could not select turnaround: {e}")
    
    async def _select_shipping_option(self, page):
        """Select the first available shipping option (usually Ground)"""
        try:
            logger.info("🚚 Selecting shipping option...")
            
            # Look for shipping method dropdown
            dropdowns = await page.query_selector_all('select, [role="button"], .MuiSelect-select')
            
            for dropdown in dropdowns:
                try:
                    # Check if this dropdown is for shipping method
                    parent = await dropdown.query_selector('xpath=..')
                    if parent:
                        parent_text = await parent.inner_text()
                        if 'ground' in parent_text.lower() or 'shipping' in parent_text.lower():
                            # Click to open dropdown
                            await dropdown.click()
                            await page.wait_for_timeout(1000)
                            
                            # Look for Ground option
                            options = await page.query_selector_all('option, [role="option"], .MuiMenuItem-root')
                            for option in options:
                                try:
                                    option_text = await option.inner_text()
                                    if 'ground' in option_text.lower():
                                        await option.click()
                                        logger.info(f"✅ Selected shipping option: {option_text}")
                                        await page.wait_for_timeout(1000)
                                        return True
                                except:
                                    continue
                except:
                    continue
            
            # If no dropdown found, look for buttons that might be shipping options
            buttons = await page.query_selector_all('button')
            for button in buttons:
                try:
                    button_text = await button.inner_text()
                    if 'ground' in button_text.lower() and 'shipping' in button_text.lower():
                        await button.click()
                        logger.info(f"✅ Selected shipping button: {button_text}")
                        return True
                except:
                    continue
                    
            logger.warning("⚠️ Could not find shipping option to select")
            return False
                    
        except Exception as e:
            logger.warning(f"⚠️ Error selecting shipping option: {e}")
            return False
    
    async def _fill_tent_options(self, page, print_options, accessories):
        """Fill tent-specific options on B2Sign form using MUI selectors"""
        try:
            logger.info("🎨 Filling tent options...")
            
            # Handle tent size - look for buttons or selectors
            tent_size = print_options.get('tent_size', '10x10')
            try:
                buttons = await page.query_selector_all('button')
                for button in buttons:
                    try:
                        button_text = await button.inner_text()
                        if tent_size in button_text or '10x10' in button_text:
                            await button.click()
                            logger.info(f"✅ Clicked tent size button: {button_text}")
                            break
                    except:
                        continue
            except Exception as e:
                logger.warning(f"⚠️ Could not handle tent size: {e}")
            
            # Handle design option - look for radio buttons or buttons
            design_option = print_options.get('tent_design_option', 'canopy-only')
            try:
                if design_option == 'canopy-only':
                    buttons = await page.query_selector_all('button')
                    for button in buttons:
                        try:
                            button_text = await button.inner_text()
                            if 'canopy' in button_text.lower():
                                await button.click()
                                logger.info(f"✅ Clicked canopy button: {button_text}")
                                break
                        except:
                            continue
                elif design_option == 'all-sides':
                    buttons = await page.query_selector_all('button')
                    for button in buttons:
                        try:
                            button_text = await button.inner_text()
                            if 'all' in button_text.lower() or 'sides' in button_text.lower():
                                await button.click()
                                logger.info(f"✅ Clicked all-sides button: {button_text}")
                                break
                        except:
                            continue
            except Exception as e:
                logger.warning(f"⚠️ Could not handle design option: {e}")
            
            # Handle accessories
            for accessory in accessories:
                try:
                    buttons = await page.query_selector_all('button')
                    for button in buttons:
                        try:
                            button_text = await button.inner_text()
                            if accessory.lower() in button_text.lower():
                                await button.click()
                                logger.info(f"✅ Clicked accessory button: {button_text}")
                                break
                        except:
                            continue
                except Exception as e:
                    logger.warning(f"⚠️ Could not handle accessory {accessory}: {e}")
                        
        except Exception as e:
            logger.warning(f"⚠️ Error filling tent options: {e}")
    
    async def _extract_all_shipping_options(self, page):
        """Extract all available shipping options from B2Sign dropdown"""
        try:
            logger.info("💰 Extracting all shipping options from dropdown...")
            
            shipping_options = []
            
            # Look for the shipping method dropdown (should show "Ground $14.04" as default)
            dropdowns = await page.query_selector_all('select, [role="button"], .MuiSelect-select, button')
            logger.info(f"Found {len(dropdowns)} potential dropdowns/buttons")
            
            for dropdown in dropdowns:
                try:
                    # Check if this dropdown contains shipping options
                    dropdown_text = await dropdown.inner_text()
                    logger.info(f"Checking element with text: '{dropdown_text}'")
                    
                    # Look for dropdown that shows "Ground" with price or shipping-related text
                    if ('ground' in dropdown_text.lower() and '$' in dropdown_text) or 'shipping' in dropdown_text.lower():
                        logger.info("✅ Found shipping dropdown, clicking to open all options...")
                        
                        # Click to open dropdown and see all options
                        await dropdown.click()
                        await page.wait_for_timeout(3000)  # Wait longer for dropdown to open
                        
                        # Get all available options from the opened dropdown
                        # Try different selectors for dropdown options
                        option_selectors = [
                            'option',
                            '[role="option"]', 
                            '.MuiMenuItem-root',
                            '.MuiListItem-root',
                            '[data-value]',
                            'li',
                            '.dropdown-item'
                        ]
                        
                        all_options = []
                        for selector in option_selectors:
                            options = await page.query_selector_all(selector)
                            all_options.extend(options)
                        
                        logger.info(f"Found {len(all_options)} total options in dropdown")
                        
                        for option in all_options:
                            try:
                                option_text = await option.inner_text()
                                if option_text and option_text.strip() and '$' in option_text:
                                    # Parse the option text to extract name, cost, and date
                                    parsed_option = self._parse_shipping_option_text(option_text)
                                    if parsed_option:
                                        shipping_options.append(parsed_option)
                                        logger.info(f"✅ Found shipping option: {parsed_option['name']} - {parsed_option['cost']}")
                                        
                            except Exception as e:
                                logger.warning(f"⚠️ Error processing option: {e}")
                                continue
                        
                        # Close dropdown by clicking outside or pressing escape
                        try:
                            await page.keyboard.press('Escape')
                            await page.wait_for_timeout(1000)
                        except:
                            # Try clicking outside the dropdown
                            await page.click('body')
                            await page.wait_for_timeout(1000)
                        
                        break
                        
                except Exception as e:
                    logger.warning(f"⚠️ Error processing dropdown: {e}")
                    continue
            
            # If no dropdown options found, look for shipping costs displayed on the page
            if not shipping_options:
                logger.info("No dropdown options found, looking for displayed shipping costs...")
                shipping_options = await self._extract_shipping_costs_from_display(page)
            
            # Remove duplicates based on name and cost
            unique_options = []
            seen = set()
            for option in shipping_options:
                key = (option['name'], option['cost'])
                if key not in seen:
                    seen.add(key)
                    unique_options.append(option)
            
            logger.info(f"✅ Returning {len(unique_options)} unique shipping options")
            return unique_options if unique_options else None
            
        except Exception as e:
            logger.error(f"❌ Error extracting shipping options: {e}")
            return None
    
    def _parse_shipping_option_text(self, option_text):
        """Parse shipping option text to extract name, cost, and delivery date"""
        try:
            import re
            
            # Extract price (e.g., $14.04)
            price_matches = re.findall(r'\$[\d,]+\.?\d*', option_text)
            cost = price_matches[0] if price_matches else "Contact for Quote"
            
            # Extract delivery date (e.g., Sep 14)
            date_matches = re.findall(r'[A-Za-z]{3}\s+\d{1,2}', option_text)
            delivery_date = date_matches[0] if date_matches else None
            
            # Extract shipping method name (everything before the price)
            name_part = option_text.split('$')[0].strip()
            if not name_part:
                name_part = option_text.split('Sep')[0].strip() if 'Sep' in option_text else option_text.strip()
            
            # Clean up the name
            name = name_part.replace('\n', ' ').strip()
            
            # Determine estimated days based on shipping method
            estimated_days = self._estimate_delivery_days(name)
            
            return {
                "name": name,
                "type": "standard",
                "cost": cost,
                "estimated_days": estimated_days,
                "delivery_date": delivery_date,
                "description": f"B2Sign {name.lower()}: {cost}" + (f" (delivery: {delivery_date})" if delivery_date else "")
            }
            
        except Exception as e:
            logger.warning(f"⚠️ Error parsing shipping option text '{option_text}': {e}")
            return None
    
    def _estimate_delivery_days(self, shipping_name):
        """Estimate delivery days based on shipping method name"""
        name_lower = shipping_name.lower()
        
        if 'next day' in name_lower and 'early am' in name_lower:
            return 1
        elif 'next day' in name_lower:
            return 1
        elif '2nd day' in name_lower or 'second day' in name_lower:
            return 2
        elif '3 day' in name_lower or 'third day' in name_lower:
            return 3
        elif 'ground' in name_lower:
            return 5
        else:
            return 5  # Default
    
    async def _extract_shipping_costs_from_display(self, page):
        """Extract shipping costs from displayed prices on the page"""
        try:
            logger.info("💰 Looking for displayed shipping costs...")
            
            shipping_options = []
            all_elements = await page.query_selector_all('*')
            
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    # Look for price patterns like $14.04
                    import re
                    price_matches = re.findall(r'\$[\d,]+\.?\d*', text)
                    
                    if price_matches:
                        # Check if this element is in the shipping section
                        parent_text = ""
                        try:
                            parent = await element.query_selector('xpath=..')
                            if parent:
                                parent_text = await parent.inner_text()
                        except:
                            pass
                        
                        # If we see shipping-related text, it's likely a shipping cost
                        if any(keyword in (text + parent_text).lower() for keyword in ['ground', 'shipping', 'delivery']):
                            shipping_cost = price_matches[0]
                            
                            # Try to determine shipping method name
                            shipping_name = "Ground Shipping"
                            if 'ground' in (text + parent_text).lower():
                                shipping_name = "Ground Shipping"
                            elif 'express' in (text + parent_text).lower():
                                shipping_name = "Express Shipping"
                            elif 'overnight' in (text + parent_text).lower():
                                shipping_name = "Overnight Shipping"
                            
                            shipping_option = {
                                "name": shipping_name,
                                "type": "standard",
                                "cost": shipping_cost,
                                "estimated_days": 5,
                                "description": f"B2Sign {shipping_name.lower()}: {shipping_cost}"
                            }
                            
                            shipping_options.append(shipping_option)
                            logger.info(f"✅ Found displayed shipping cost: {shipping_name} - {shipping_cost}")
                            
                except:
                    continue
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error extracting displayed shipping costs: {e}")
            return []

    async def _extract_shipping_cost_from_order(self, page):
        """Extract shipping cost from B2Sign order results"""
        try:
            logger.info("💰 Extracting shipping cost...")
            
            # Look for shipping cost in the shipping section
            # Based on the form, we should look for "$14.04" near "Ground" dropdown
            all_elements = await page.query_selector_all('*')
            
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    # Look for price patterns like $14.04
                    import re
                    price_matches = re.findall(r'\$[\d,]+\.?\d*', text)
                    
                    if price_matches:
                        # Check if this element is in the shipping section
                        parent_text = ""
                        try:
                            parent = await element.query_selector('xpath=..')
                            if parent:
                                parent_text = await parent.inner_text()
                        except:
                            pass
                        
                        # If we see shipping-related text or price near "Ground", it's likely shipping cost
                        if any(keyword in (text + parent_text).lower() for keyword in ['ground', 'shipping', 'delivery']):
                            shipping_cost = price_matches[0]
                            logger.info(f"✅ Found shipping cost: {shipping_cost}")
                            return shipping_cost
                            
                except:
                    continue
            
            # If not found in shipping section, look for any price that might be shipping
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    import re
                    price_matches = re.findall(r'\$[\d,]+\.?\d*', text)
                    
                    if price_matches and len(text.strip()) < 20:  # Short text likely to be just a price
                        # Check if it's near shipping-related elements
                        try:
                            parent = await element.query_selector('xpath=..')
                            if parent:
                                parent_text = await parent.inner_text()
                                if any(keyword in parent_text.lower() for keyword in ['shipping', 'ground', 'delivery']):
                                    shipping_cost = price_matches[0]
                                    logger.info(f"✅ Found shipping cost in parent: {shipping_cost}")
                                    return shipping_cost
                        except:
                            pass
                            
                except:
                    continue
            
            logger.warning("⚠️ Could not find shipping cost")
            return None
            
        except Exception as e:
            logger.error(f"❌ Error extracting shipping cost: {e}")
            return None
    
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
                headless=False,
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
            
            # Step 4: Create mock order with customer's exact specifications
            logger.info("📝 Step 4: Creating mock order with customer specifications...")
            
            # Extract customer specifications from order data
            dimensions = order_data.get('dimensions', {})
            width = dimensions.get('width', 2)
            height = dimensions.get('height', 4)
            quantity = order_data.get('quantity', 1)
            print_options = order_data.get('print_options', {})
            accessories = order_data.get('accessories', [])
            customer_info = order_data.get('customer_info', {})
            zip_code = customer_info.get('zipCode', customer_info.get('zip_code', '10001'))
            
            logger.info(f"📋 Order specs: {width}x{height}, qty: {quantity}, zip: {zip_code}")
            logger.info(f"🎨 Print options: {print_options}")
            logger.info(f"🎁 Accessories: {accessories}")
            
            # Fill out the B2Sign order form with customer's exact specifications
            # Create an instance of the integration class to use its methods
            integration = B2SignPlaywrightIntegration()
            shipping_options = await integration._create_mock_order_and_get_shipping(
                page, product_type, dimensions, quantity, print_options, accessories, zip_code
            )
            
            if shipping_options:
                return {
                    'success': True,
                    'shipping_options': shipping_options,
                    'b2sign_product_url': page.url,
                    'extracted_at': datetime.now().isoformat()
                }
            else:
                return {
                    'success': False,
                    'errors': ['Could not extract shipping options from B2Sign mock order'],
                    'shipping_options': []
                }
            
    except Exception as e:
        logger.error(f"❌ Error in Playwright shipping costs: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }
