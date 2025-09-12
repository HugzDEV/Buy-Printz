#!/usr/bin/env python3
"""
B2Sign Page Analyzer using Playwright
Analyzes the page structure to generate exact selectors for integration
"""

import asyncio
import json
import logging
from playwright.async_api import async_playwright
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignPlaywrightAnalyzer:
    def __init__(self):
        self.page_structure = {}
        self.selectors = {}
        
    async def analyze_page(self):
        """Analyze the B2Sign page structure"""
        logger.info("🔍 Starting B2Sign page analysis...")
        
        try:
            # Use existing integration to login and navigate
            integration = B2SignPlaywrightIntegration()
            await integration.initialize()
            await integration.login()
            
            # Navigate to specific banner product page
            logger.info("🌐 Navigating to 13oz vinyl banner product page...")
            await integration.page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await integration.page.wait_for_timeout(3000)
            
            logger.info("✅ Successfully logged in and navigated to banner page")
            
            # Get the page from integration
            page = integration.page
            
            # Analyze different sections
            await self._analyze_dimension_inputs(page)
            await self._analyze_radio_buttons(page)
            await self._analyze_dropdowns(page)
            await self._analyze_buttons(page)
            await self._analyze_shipping_section(page)
            
            # Generate optimized selectors
            self._generate_selectors()
            
            # Save results
            self._save_analysis()
            
            # Print summary
            self._print_summary()
            
        except Exception as e:
            logger.error(f"❌ Error during analysis: {e}")
        finally:
            if 'integration' in locals():
                await integration.close()
    
    async def _analyze_dimension_inputs(self, page):
        """Analyze dimension input fields"""
        logger.info("📏 Analyzing dimension input fields...")
        
        # Wait for page to load
        await page.wait_for_timeout(3000)
        
        # Find all input fields
        inputs = await page.query_selector_all('input')
        dimension_inputs = []
        
        for i, input_elem in enumerate(inputs):
            try:
                # Get element properties
                element_info = {
                    'index': i,
                    'tag': await input_elem.evaluate('el => el.tagName'),
                    'type': await input_elem.get_attribute('type'),
                    'name': await input_elem.get_attribute('name'),
                    'id': await input_elem.get_attribute('id'),
                    'class': await input_elem.get_attribute('class'),
                    'placeholder': await input_elem.get_attribute('placeholder'),
                    'value': await input_elem.get_attribute('value'),
                    'visible': await input_elem.is_visible(),
                    'enabled': await input_elem.is_enabled()
                }
                
                # Try to find associated label
                try:
                    if element_info['id']:
                        label = await page.query_selector(f"label[for='{element_info['id']}']")
                        if label:
                            element_info['label_text'] = await label.inner_text()
                        else:
                            element_info['label_text'] = None
                    else:
                        element_info['label_text'] = None
                except:
                    element_info['label_text'] = None
                
                # Try to find parent with text
                try:
                    parent = await input_elem.query_selector('xpath=..')
                    if parent:
                        parent_text = await parent.inner_text()
                        element_info['parent_text'] = parent_text[:100] if parent_text else None
                    else:
                        element_info['parent_text'] = None
                except:
                    element_info['parent_text'] = None
                
                dimension_inputs.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze input {i}: {e}")
        
        self.page_structure['dimension_inputs'] = dimension_inputs
        logger.info(f"✅ Analyzed {len(dimension_inputs)} input fields")
    
    async def _analyze_radio_buttons(self, page):
        """Analyze radio button elements"""
        logger.info("📻 Analyzing radio button elements...")
        
        # Find all radio buttons
        radios = await page.query_selector_all('input[type="radio"]')
        radio_buttons = []
        
        for i, radio in enumerate(radios):
            try:
                element_info = {
                    'index': i,
                    'tag': await radio.evaluate('el => el.tagName'),
                    'type': await radio.get_attribute('type'),
                    'name': await radio.get_attribute('name'),
                    'id': await radio.get_attribute('id'),
                    'class': await radio.get_attribute('class'),
                    'value': await radio.get_attribute('value'),
                    'checked': await radio.is_checked(),
                    'visible': await radio.is_visible(),
                    'enabled': await radio.is_enabled()
                }
                
                # Find associated text using multiple methods
                label_text = None
                
                # Method 1: Look for label with for attribute
                if element_info['id']:
                    try:
                        label = await page.query_selector(f"label[for='{element_info['id']}']")
                        if label:
                            label_text = await label.inner_text()
                    except:
                        pass
                
                # Method 2: Look for parent with text
                if not label_text:
                    try:
                        parent = await radio.query_selector('xpath=..')
                        if parent:
                            parent_text = await parent.inner_text()
                            if parent_text.strip():
                                label_text = parent_text.strip()
                    except:
                        pass
                
                # Method 3: Look for sibling elements
                if not label_text:
                    try:
                        parent = await radio.query_selector('xpath=..')
                        if parent:
                            siblings = await parent.query_selector_all('*')
                            for sibling in siblings:
                                try:
                                    sibling_text = await sibling.inner_text()
                                    if sibling_text.strip() and sibling_text != await radio.inner_text():
                                        label_text = sibling_text.strip()
                                        break
                                except:
                                    continue
                    except:
                        pass
                
                element_info['label_text'] = label_text
                radio_buttons.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze radio button {i}: {e}")
        
        self.page_structure['radio_buttons'] = radio_buttons
        logger.info(f"✅ Analyzed {len(radio_buttons)} radio buttons")
    
    async def _analyze_dropdowns(self, page):
        """Analyze dropdown elements"""
        logger.info("📋 Analyzing dropdown elements...")
        
        dropdowns = []
        
        # Standard select elements
        selects = await page.query_selector_all('select')
        for i, select in enumerate(selects):
            try:
                element_info = {
                    'index': i,
                    'type': 'select',
                    'tag': await select.evaluate('el => el.tagName'),
                    'name': await select.get_attribute('name'),
                    'id': await select.get_attribute('id'),
                    'class': await select.get_attribute('class'),
                    'visible': await select.is_visible(),
                    'enabled': await select.is_enabled()
                }
                
                # Get options
                options = await select.query_selector_all('option')
                element_info['options'] = []
                for option in options:
                    try:
                        option_text = await option.inner_text()
                        element_info['options'].append(option_text)
                    except:
                        pass
                
                dropdowns.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze select {i}: {e}")
        
        # MUI dropdowns (buttons that might open dropdowns)
        buttons = await page.query_selector_all('button, [role="button"]')
        for i, button in enumerate(buttons):
            try:
                text = await button.inner_text()
                if any(keyword in text.lower() for keyword in ['ground', 'shipping', 'select', 'choose', 'option', 'edit']):
                    element_info = {
                        'index': i,
                        'type': 'mui_button',
                        'tag': await button.evaluate('el => el.tagName'),
                        'text': text,
                        'class': await button.get_attribute('class'),
                        'id': await button.get_attribute('id'),
                        'visible': await button.is_visible(),
                        'enabled': await button.is_enabled()
                    }
                    dropdowns.append(element_info)
                    
            except Exception as e:
                continue
        
        self.page_structure['dropdowns'] = dropdowns
        logger.info(f"✅ Analyzed {len(dropdowns)} dropdown elements")
    
    async def _analyze_buttons(self, page):
        """Analyze button elements"""
        logger.info("🔘 Analyzing button elements...")
        
        buttons = []
        button_elements = await page.query_selector_all('button, input[type="button"], input[type="submit"], [role="button"]')
        
        for i, button in enumerate(button_elements):
            try:
                element_info = {
                    'index': i,
                    'tag': await button.evaluate('el => el.tagName'),
                    'type': await button.get_attribute('type'),
                    'text': await button.inner_text(),
                    'class': await button.get_attribute('class'),
                    'id': await button.get_attribute('id'),
                    'name': await button.get_attribute('name'),
                    'visible': await button.is_visible(),
                    'enabled': await button.is_enabled()
                }
                
                buttons.append(element_info)
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze button {i}: {e}")
        
        self.page_structure['buttons'] = buttons
        logger.info(f"✅ Analyzed {len(buttons)} button elements")
    
    async def _analyze_shipping_section(self, page):
        """Specifically analyze the shipping section"""
        logger.info("🚚 Analyzing shipping section...")
        
        shipping_section = {}
        
        # Look for shipping-related elements
        shipping_keywords = ['shipping', 'ship', 'delivery', 'blind drop', 'store pickup', 'edit']
        
        # Find elements containing shipping keywords
        all_elements = await page.query_selector_all('*')
        shipping_elements = []
        
        for element in all_elements:
            try:
                text = await element.inner_text()
                if text and any(keyword in text.lower() for keyword in shipping_keywords):
                    element_info = {
                        'tag': await element.evaluate('el => el.tagName'),
                        'text': text.strip(),
                        'class': await element.get_attribute('class'),
                        'id': await element.get_attribute('id'),
                        'visible': await element.is_visible(),
                        'enabled': await element.is_enabled()
                    }
                    shipping_elements.append(element_info)
            except:
                continue
        
        shipping_section['elements'] = shipping_elements
        
        # Look for "Ship to" edit button specifically
        edit_buttons = []
        for element in all_elements:
            try:
                text = await element.inner_text()
                if text and 'edit' in text.lower() and ('ship' in text.lower() or 'address' in text.lower()):
                    element_info = {
                        'tag': await element.evaluate('el => el.tagName'),
                        'text': text.strip(),
                        'class': await element.get_attribute('class'),
                        'id': await element.get_attribute('id'),
                        'visible': await element.is_visible(),
                        'enabled': await element.is_enabled()
                    }
                    edit_buttons.append(element_info)
            except:
                continue
        
        shipping_section['edit_buttons'] = edit_buttons
        
        self.page_structure['shipping_section'] = shipping_section
        logger.info(f"✅ Analyzed {len(shipping_elements)} shipping elements and {len(edit_buttons)} edit buttons")
    
    def _generate_selectors(self):
        """Generate optimized selectors for Playwright"""
        logger.info("🎯 Generating optimized selectors...")
        
        self.selectors = {
            'dimension_inputs': [],
            'radio_buttons': [],
            'dropdowns': [],
            'buttons': [],
            'shipping_elements': []
        }
        
        # Generate selectors for dimension inputs
        for input_info in self.page_structure.get('dimension_inputs', []):
            if input_info.get('visible') and input_info.get('enabled'):
                selector = self._generate_selector(input_info)
                if selector:
                    self.selectors['dimension_inputs'].append({
                        'selector': selector,
                        'description': input_info.get('label_text') or input_info.get('parent_text') or 'Unknown input',
                        'element_info': input_info
                    })
        
        # Generate selectors for radio buttons
        for radio_info in self.page_structure.get('radio_buttons', []):
            if radio_info.get('visible') and radio_info.get('enabled'):
                selector = self._generate_selector(radio_info)
                if selector:
                    self.selectors['radio_buttons'].append({
                        'selector': selector,
                        'description': radio_info.get('label_text') or 'Unknown radio',
                        'element_info': radio_info
                    })
        
        # Generate selectors for buttons
        for button_info in self.page_structure.get('buttons', []):
            if button_info.get('visible') and button_info.get('enabled'):
                selector = self._generate_selector(button_info)
                if selector:
                    self.selectors['buttons'].append({
                        'selector': selector,
                        'description': button_info.get('text') or 'Unknown button',
                        'element_info': button_info
                    })
        
        # Generate selectors for shipping elements
        for shipping_info in self.page_structure.get('shipping_section', {}).get('elements', []):
            if shipping_info.get('visible') and shipping_info.get('enabled'):
                selector = self._generate_selector(shipping_info)
                if selector:
                    self.selectors['shipping_elements'].append({
                        'selector': selector,
                        'description': shipping_info.get('text') or 'Unknown shipping element',
                        'element_info': shipping_info
                    })
    
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
    
    def _save_analysis(self):
        """Save the analysis to JSON files"""
        try:
            # Save full page structure
            with open('b2sign_page_analysis.json', 'w') as f:
                json.dump(self.page_structure, f, indent=2, default=str)
            logger.info("✅ Page analysis saved to b2sign_page_analysis.json")
            
            # Save optimized selectors
            with open('b2sign_selectors.json', 'w') as f:
                json.dump(self.selectors, f, indent=2, default=str)
            logger.info("✅ Selectors saved to b2sign_selectors.json")
            
        except Exception as e:
            logger.error(f"❌ Error saving analysis: {e}")
    
    def _print_summary(self):
        """Print analysis summary"""
        print("\n" + "="*60)
        print("🎯 B2SIGN PAGE ANALYSIS COMPLETE")
        print("="*60)
        print(f"📏 Dimension inputs: {len(self.selectors['dimension_inputs'])}")
        print(f"📻 Radio buttons: {len(self.selectors['radio_buttons'])}")
        print(f"📋 Dropdowns: {len(self.selectors['dropdowns'])}")
        print(f"🔘 Buttons: {len(self.selectors['buttons'])}")
        print(f"🚚 Shipping elements: {len(self.selectors['shipping_elements'])}")
        print("="*60)
        
        # Show key findings
        print("\n🔍 KEY FINDINGS:")
        
        # Show radio buttons
        print("\n📻 Radio Buttons:")
        for radio in self.selectors['radio_buttons']:
            print(f"  - {radio['description']}: {radio['selector']}")
        
        # Show shipping-related buttons
        print("\n🚚 Shipping Buttons:")
        for button in self.selectors['buttons']:
            if any(keyword in button['description'].lower() for keyword in ['ship', 'edit', 'address']):
                print(f"  - {button['description']}: {button['selector']}")
        
        # Show dimension inputs
        print("\n📏 Dimension Inputs:")
        for input_elem in self.selectors['dimension_inputs']:
            print(f"  - {input_elem['description']}: {input_elem['selector']}")
        
        # Show shipping elements
        print("\n🚚 Shipping Elements:")
        for shipping_elem in self.selectors['shipping_elements']:
            print(f"  - {shipping_elem['description']}: {shipping_elem['selector']}")

async def main():
    """Main function to run the analyzer"""
    analyzer = B2SignPlaywrightAnalyzer()
    await analyzer.analyze_page()

if __name__ == "__main__":
    asyncio.run(main())
