#!/usr/bin/env python3
"""
B2Sign Estimate Page Analyzer
This script specifically analyzes the /estimate page to understand the quote process.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class B2SignEstimateAnalyzer:
    def __init__(self):
        self.base_url = 'https://b2sign.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def analyze_estimate_page(self):
        """Analyze the /estimate page in detail"""
        estimate_url = 'https://b2sign.com/estimate'
        
        try:
            logger.info(f"🔍 Analyzing estimate page: {estimate_url}")
            response = self.session.get(estimate_url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Save the HTML for inspection
            with open('b2sign_estimate_page.html', 'w', encoding='utf-8') as f:
                f.write(str(soup.prettify()))
            logger.info("💾 Saved estimate page HTML to: b2sign_estimate_page.html")
            
            # Analyze the page structure
            analysis = {
                'url': estimate_url,
                'title': soup.title.string if soup.title else 'No title',
                'forms': [],
                'product_options': [],
                'pricing_elements': [],
                'page_text': soup.get_text(),
                'all_links': [],
                'all_inputs': []
            }
            
            # Find all forms
            forms = soup.find_all('form')
            for i, form in enumerate(forms):
                form_info = self.analyze_form(form, i)
                analysis['forms'].append(form_info)
            
            # Find all input elements
            inputs = soup.find_all(['input', 'select', 'textarea'])
            for input_elem in inputs:
                input_info = self.analyze_input(input_elem)
                analysis['all_inputs'].append(input_info)
            
            # Find all links
            links = soup.find_all('a', href=True)
            for link in links:
                link_info = {
                    'text': link.get_text().strip(),
                    'href': link['href'],
                    'full_url': urljoin(estimate_url, link['href'])
                }
                analysis['all_links'].append(link_info)
            
            # Look for product-related elements
            self.find_product_elements(soup, analysis)
            
            # Look for pricing elements
            self.find_pricing_elements(soup, analysis)
            
            # Save analysis
            with open('b2sign_estimate_analysis.json', 'w') as f:
                json.dump(analysis, f, indent=2)
            
            logger.info("💾 Saved detailed analysis to: b2sign_estimate_analysis.json")
            
            # Print summary
            self.print_summary(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze estimate page: {e}")
            return None
    
    def analyze_form(self, form, index):
        """Analyze a specific form"""
        form_info = {
            'index': index,
            'action': form.get('action', ''),
            'method': form.get('method', 'GET'),
            'id': form.get('id', ''),
            'class': form.get('class', []),
            'fields': []
        }
        
        # Get form action URL
        action_url = urljoin(self.base_url, form_info['action']) if form_info['action'] else self.base_url
        form_info['action_url'] = action_url
        
        # Analyze form fields
        inputs = form.find_all(['input', 'select', 'textarea'])
        for input_elem in inputs:
            field_info = self.analyze_input(input_elem)
            form_info['fields'].append(field_info)
        
        return form_info
    
    def analyze_input(self, input_elem):
        """Analyze a specific input element"""
        input_info = {
            'tag': input_elem.name,
            'type': input_elem.get('type', 'text'),
            'name': input_elem.get('name', ''),
            'id': input_elem.get('id', ''),
            'class': input_elem.get('class', []),
            'placeholder': input_elem.get('placeholder', ''),
            'value': input_elem.get('value', ''),
            'required': input_elem.has_attr('required'),
            'options': []
        }
        
        # For select elements, get options
        if input_elem.name == 'select':
            options = input_elem.find_all('option')
            for option in options:
                option_info = {
                    'value': option.get('value', ''),
                    'text': option.get_text().strip(),
                    'selected': option.has_attr('selected')
                }
                input_info['options'].append(option_info)
        
        return input_info
    
    def find_product_elements(self, soup, analysis):
        """Find product-related elements on the page"""
        # Look for product categories, materials, sizes, etc.
        product_keywords = [
            'banner', 'vinyl', 'fabric', 'material', 'size', 'dimension',
            'width', 'height', 'quantity', 'finish', 'grommet', 'hemming'
        ]
        
        for keyword in product_keywords:
            elements = soup.find_all(text=re.compile(keyword, re.I))
            for element in elements:
                if element.parent:
                    analysis['product_options'].append({
                        'keyword': keyword,
                        'text': element.strip(),
                        'parent_tag': element.parent.name,
                        'parent_class': element.parent.get('class', [])
                    })
    
    def find_pricing_elements(self, soup, analysis):
        """Find pricing-related elements on the page"""
        # Look for price displays, cost calculations, etc.
        price_patterns = [
            r'\$[\d,]+\.?\d*',
            r'price',
            r'cost',
            r'total',
            r'quote',
            r'estimate'
        ]
        
        for pattern in price_patterns:
            elements = soup.find_all(text=re.compile(pattern, re.I))
            for element in elements:
                if element.parent:
                    analysis['pricing_elements'].append({
                        'pattern': pattern,
                        'text': element.strip(),
                        'parent_tag': element.parent.name,
                        'parent_class': element.parent.get('class', [])
                    })
    
    def print_summary(self, analysis):
        """Print a summary of the analysis"""
        logger.info(f"\n📋 ESTIMATE PAGE ANALYSIS SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"URL: {analysis['url']}")
        logger.info(f"Title: {analysis['title']}")
        logger.info(f"Forms found: {len(analysis['forms'])}")
        logger.info(f"Input elements: {len(analysis['all_inputs'])}")
        logger.info(f"Links found: {len(analysis['all_links'])}")
        logger.info(f"Product elements: {len(analysis['product_options'])}")
        logger.info(f"Pricing elements: {len(analysis['pricing_elements'])}")
        
        logger.info(f"\n🔍 FORMS:")
        for i, form in enumerate(analysis['forms']):
            logger.info(f"  Form {i}: {form['method']} -> {form['action_url']}")
            logger.info(f"    Fields: {len(form['fields'])}")
            for field in form['fields']:
                logger.info(f"      - {field['name']} ({field['type']}) - {field['placeholder']}")
        
        logger.info(f"\n📝 INPUT ELEMENTS:")
        for input_elem in analysis['all_inputs']:
            if input_elem['name'] or input_elem['placeholder']:
                logger.info(f"  - {input_elem['name']} ({input_elem['type']}) - {input_elem['placeholder']}")
        
        logger.info(f"\n🔗 RELEVANT LINKS:")
        for link in analysis['all_links']:
            if any(keyword in link['text'].lower() for keyword in ['quote', 'estimate', 'price', 'order', 'product']):
                logger.info(f"  - {link['text']} -> {link['href']}")

def main():
    """Run the B2Sign estimate page analysis"""
    logger.info("🚀 Starting B2Sign estimate page analysis...")
    
    analyzer = B2SignEstimateAnalyzer()
    analysis = analyzer.analyze_estimate_page()
    
    if analysis:
        logger.info("✅ Estimate page analysis completed successfully!")
        return analysis
    else:
        logger.error("❌ Estimate page analysis failed!")
        return None

if __name__ == "__main__":
    main()
