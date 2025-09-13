#!/usr/bin/env python3
"""
Tent Workflow
Production tent workflow that follows the exact same structure as the proven banner workflow
but adapted for tent-specific fields and requirements.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from playwright.async_api import Page

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TentWorkflow:
    """Tent workflow that emulates the proven banner workflow structure"""
    
    def __init__(self, page: Page):
        self.page = page
    
    async def fill_tent_quote_form_workflow(self, order_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fill out tent quote form using the complete proven workflow structure
        This follows the exact same steps as _fill_banner_quote_form but adapted for tents
        """
        try:
            logger.info("🏕️ Starting complete tent workflow (emulating proven banner workflow)...")
            
            # Extract order specifications
            dimensions = order_data.get('dimensions', {})
            width = dimensions.get('width', 10)
            height = dimensions.get('height', 10)
            quantity = order_data.get('quantity', 1)
            print_options = order_data.get('print_options', {})
            customer_info = order_data.get('customer_info', {})
            zip_code = customer_info.get('zipCode', customer_info.get('zip_code', '90210'))
            
            logger.info(f"📋 Tent specs: {width}x{height}, qty: {quantity}, zip: {zip_code}")
            
            # Step 1: Fill tent dimensions using MUI selectors (adapted from banner workflow)
            await self._fill_tent_dimensions(width, height)
            
            # Step 2: Fill job details (same as banner workflow)
            await self._fill_tent_job_details(width, height, quantity)
            
            # Step 3: Fill tent options (adapted from banner options)
            await self._fill_tent_options_workflow(print_options)
            
            # Step 4: Select Blind Drop Ship (exact same as banner workflow)
            await self._select_blind_drop_ship()
            
            # Step 5: Open address modal and fill customer address (exact same as banner workflow)
            await self._open_and_fill_address_modal(zip_code, customer_info)
            
            # Step 6: Extract all shipping options (exact same as banner workflow)
            shipping_options = await self._extract_all_shipping_options_workflow()
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error in complete tent workflow: {e}")
            return []
    
    async def _fill_tent_dimensions(self, width: int, height: int):
        """Fill tent dimensions using MUI selectors (adapted from banner dimensions)"""
        try:
            logger.info(f"📏 Filling tent dimensions: {width}ft x {height}ft")
            
            # For tents, we need to select the tent size option
            # Look for tent size buttons/options
            tent_size_buttons = await self.page.query_selector_all('button')
            for button in tent_size_buttons:
                try:
                    button_text = await button.inner_text()
                    if f'{width}x{height}' in button_text or f'{width}\'x{height}\'' in button_text:
                        await button.click()
                        logger.info(f"✅ Selected tent size: {button_text}")
                        await self.page.wait_for_timeout(2000)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error filling tent dimensions: {e}")
    
    async def _fill_tent_job_details(self, width: int, height: int, quantity: int):
        """Fill job name and quantity (same as banner workflow)"""
        try:
            logger.info("📝 Filling tent job details...")
            
            # Fill job name
            job_name_input = await self.page.query_selector('input[placeholder*="Job Name"]')
            if job_name_input:
                job_name = f"BuyPrintz-Tent-{width}x{height}"
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
            logger.warning(f"⚠️ Error filling tent job details: {e}")
    
    async def _fill_tent_options_workflow(self, print_options: Dict[str, Any]):
        """Fill tent options using proven workflow structure"""
        try:
            logger.info("🎨 Filling tent options...")
            
            # Select tent design option (Canopy Graphic Only vs Canopy Graphic + Frame)
            design_option = print_options.get('tent_design_option', 'canopy-graphic-only')
            
            if design_option == 'canopy-graphic-only':
                # Look for "Canopy Graphic Only" button
                buttons = await self.page.query_selector_all('button')
                for button in buttons:
                    try:
                        button_text = await button.inner_text()
                        if 'canopy graphic only' in button_text.lower():
                            await button.click()
                            logger.info("✅ Selected Canopy Graphic Only")
                            await self.page.wait_for_timeout(2000)
                            break
                    except:
                        continue
            elif design_option == 'canopy-graphic-plus-frame':
                # Look for "Canopy Graphic + Frame" button
                buttons = await self.page.query_selector_all('button')
                for button in buttons:
                    try:
                        button_text = await button.inner_text()
                        if 'canopy graphic + frame' in button_text.lower() or 'canopy graphic plus frame' in button_text.lower():
                            await button.click()
                            logger.info("✅ Selected Canopy Graphic + Frame")
                            await self.page.wait_for_timeout(2000)
                            break
                    except:
                        continue
            
            # Select wall options if specified
            wall_option = print_options.get('wall_option', 'no-walls')
            if wall_option != 'no-walls':
                await self._select_wall_option(wall_option)
                        
        except Exception as e:
            logger.warning(f"⚠️ Error filling tent options: {e}")
    
    async def _select_wall_option(self, wall_option: str):
        """Select wall option (half-walls or full-walls)"""
        try:
            logger.info(f"🏗️ Selecting wall option: {wall_option}")
            
            buttons = await self.page.query_selector_all('button')
            for button in buttons:
                try:
                    button_text = await button.inner_text()
                    if wall_option == 'half-walls' and 'half wall' in button_text.lower():
                        await button.click()
                        logger.info("✅ Selected Half Walls")
                        await self.page.wait_for_timeout(2000)
                        break
                    elif wall_option == 'full-walls' and 'full wall' in button_text.lower():
                        await button.click()
                        logger.info("✅ Selected Full Walls")
                        await self.page.wait_for_timeout(2000)
                        break
                except:
                    continue
                    
        except Exception as e:
            logger.warning(f"⚠️ Error selecting wall option: {e}")
    
    async def _select_blind_drop_ship(self):
        """Select Blind Drop Ship using proven workflow (exact same as banner workflow)"""
        try:
            logger.info("🚚 Selecting Blind Drop Ship...")
            
            # Use proven method from banner workflow
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
    
    async def _open_and_fill_address_modal(self, zip_code: str, customer_info: Dict[str, Any]):
        """Open address modal and fill customer address using proven workflow (exact same as banner workflow)"""
        try:
            logger.info("📝 Opening and filling address modal...")
            
            # Step 1: Click pencil icon to open modal (exact same as banner workflow)
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
            
            # Step 2: Fill address fields using customer info (exact same as banner workflow)
            if not customer_info:
                raise ValueError("Customer information is required for shipping address")
            
            name = customer_info.get('name')
            company = customer_info.get('company', '')
            phone = customer_info.get('phone')
            address = customer_info.get('address')
            suburb = customer_info.get('suburb', '')
            city = customer_info.get('city')
            state = customer_info.get('state')
            
            # Validate required fields
            if not all([name, phone, address, city, state]):
                raise ValueError("All customer address fields are required")
            
            address_fields = [
                ('input[name="fullname"]', name),
                ('input[name="company"]', company),
                ('input[name="telephone"]', phone),
                ('input[placeholder="Street address"]', address),
                ('input[name="suburb"]', suburb),
                ('input[name="city"]', city),
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
            
            # Step 3: Select state using MuiAutocomplete (exact same as banner workflow)
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
                                await input_field.fill(state)
                                await self.page.wait_for_timeout(1000)
                                
                                state_options = await self.page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
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
            
            # Step 4: Click "Use this address" button (exact same as banner workflow)
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
        """Extract all shipping options using proven workflow (exact same as banner workflow)"""
        try:
            logger.info("🚚 Extracting all shipping options...")
            
            # Wait for shipping dropdown to appear
            await self.page.wait_for_timeout(3000)
            
            # Look for shipping method dropdown (exact same as banner workflow)
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
                # Click the dropdown to reveal all options (exact same as banner workflow)
                await shipping_dropdown.click()
                logger.info("✅ Clicked shipping dropdown to reveal all options")
                await self.page.wait_for_timeout(2000)
                
                # Extract all shipping options (exact same as banner workflow)
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
    
    def _get_state_names(self, state_code: str) -> List[str]:
        """Get possible state names for a given state code (exact same as banner workflow)"""
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
    
    def _parse_shipping_option_text(self, option_text: str) -> Optional[Dict[str, Any]]:
        """Parse shipping option text to extract name, cost, and delivery date (exact same as banner workflow)"""
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
    
    def _estimate_delivery_days(self, shipping_name: str) -> int:
        """Estimate delivery days based on shipping method name (exact same as banner workflow)"""
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
