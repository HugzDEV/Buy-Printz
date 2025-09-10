import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import urljoin
import time
import re
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class SiteMapper:
    """
    Intelligent site mapping using BeautifulSoup4 to analyze print partner websites
    and extract form structures, selectors, and patterns for automated interaction.
    """
    
    def __init__(self, base_url: str, session: Optional[requests.Session] = None):
        self.base_url = base_url
        self.session = session or requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.site_map = {
            'forms': {},
            'selectors': {},
            'urls': {},
            'patterns': {},
            'dynamic': {}
        }
    
    def authenticate(self, login_url: str, username: str, password: str) -> Dict[str, Any]:
        """
        Handle initial authentication and maintain session.
        Maps login form structure for later use by Selenium.
        """
        try:
            response = self.session.get(login_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find login form structure
            login_form = soup.find('form')
            if not login_form:
                # Look for forms with login-related keywords
                forms = soup.find_all('form')
                for form in forms:
                    form_text = form.get_text().lower()
                    if any(keyword in form_text for keyword in ['login', 'sign in', 'authenticate']):
                        login_form = form
                        break
            
            if not login_form:
                raise Exception("No login form found")
            
            action_url = urljoin(self.base_url, login_form.get('action', ''))
            
            # Map login form fields
            fields = {}
            for input_field in login_form.find_all(['input', 'select', 'textarea']):
                field_name = input_field.get('name')
                field_type = input_field.get('type', 'text')
                if field_name:
                    fields[field_name] = {
                        'type': field_type,
                        'required': input_field.get('required') is not None,
                        'selector': self._generate_selector(input_field),
                        'placeholder': input_field.get('placeholder', ''),
                        'id': input_field.get('id', '')
                    }
            
            # Store login form intelligence
            self.site_map['forms']['login'] = {
                'action_url': action_url,
                'method': login_form.get('method', 'POST').upper(),
                'fields': fields,
                'csrf_token_field': self._find_csrf_token(login_form)
            }
            
            # Perform actual login
            login_data = self._prepare_login_data(login_form, username, password)
            login_response = self.session.post(action_url, data=login_data)
            
            # Check if login was successful
            if self._is_login_successful(login_response):
                logger.info("Successfully authenticated with print partner")
                return self.site_map['forms']['login']
            else:
                raise Exception("Login failed")
                
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            raise
    
    def map_quote_form(self, quote_url: str) -> Dict[str, Any]:
        """
        Map the structure of the shipping quote form.
        Identifies form fields, selectors, and result containers.
        """
        try:
            response = self.session.get(quote_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the main quote form
            quote_forms = soup.find_all('form')
            quote_form = None
            
            for form in quote_forms:
                # Look for forms that likely handle quotes/shipping
                form_text = form.get_text().lower()
                if any(keyword in form_text for keyword in ['quote', 'shipping', 'calculate', 'estimate', 'price']):
                    quote_form = form
                    break
            
            if not quote_form:
                # Fallback: use the largest form (likely the main form)
                quote_form = max(quote_forms, key=lambda f: len(f.find_all(['input', 'select', 'textarea'])))
            
            form_map = {
                'action_url': urljoin(self.base_url, quote_form.get('action', '')),
                'method': quote_form.get('method', 'POST').upper(),
                'fields': {},
                'result_selectors': [],
                'submit_selectors': []
            }
            
            # Map all form fields
            for field in quote_form.find_all(['input', 'select', 'textarea']):
                field_name = field.get('name')
                if field_name:
                    field_map = {
                        'type': field.get('type', 'text'),
                        'selector': self._generate_selector(field),
                        'required': field.get('required') is not None,
                        'placeholder': field.get('placeholder', ''),
                        'id': field.get('id', ''),
                        'class': ' '.join(field.get('class', []))
                    }
                    
                    # Special handling for select dropdowns
                    if field.name == 'select':
                        options = []
                        for opt in field.find_all('option'):
                            option_data = {
                                'value': opt.get('value', ''),
                                'text': opt.get_text().strip()
                            }
                            options.append(option_data)
                        field_map['options'] = options
                    
                    form_map['fields'][field_name] = field_map
            
            # Look for submit buttons
            submit_buttons = quote_form.find_all(['input', 'button'], 
                type=lambda x: x in ['submit', 'button'] if x else False)
            for button in submit_buttons:
                form_map['submit_selectors'].append(self._generate_selector(button))
            
            # Look for likely shipping result containers
            potential_result_containers = soup.find_all(['div', 'span', 'p', 'td', 'th'], 
                class_=lambda x: x and any(term in x.lower() for term in 
                    ['shipping', 'cost', 'total', 'price', 'quote', 'estimate', 'result']))
            
            form_map['result_selectors'] = [self._generate_selector(elem) for elem in potential_result_containers]
            
            self.site_map['forms']['quote'] = form_map
            logger.info(f"Mapped quote form with {len(form_map['fields'])} fields")
            return form_map
            
        except Exception as e:
            logger.error(f"Failed to map quote form: {e}")
            raise
    
    def detect_dynamic_elements(self, url: str) -> Dict[str, List[str]]:
        """
        Identify elements that might be loaded dynamically via AJAX.
        """
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            dynamic_indicators = {
                'ajax_endpoints': [],
                'loading_indicators': [],
                'dynamic_containers': [],
                'javascript_events': []
            }
            
            # Look for AJAX endpoints in script tags
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string:
                    # Find API endpoints
                    api_patterns = re.findall(r'["\'](/api/[^"\']*)["\']', script.string)
                    dynamic_indicators['ajax_endpoints'].extend(api_patterns)
                    
                    # Find AJAX calls
                    ajax_patterns = re.findall(r'\.ajax\(|fetch\(|XMLHttpRequest', script.string)
                    if ajax_patterns:
                        dynamic_indicators['javascript_events'].extend(ajax_patterns)
            
            # Look for loading indicators
            loading_elements = soup.find_all(class_=lambda x: x and any(term in x.lower() 
                for term in ['loading', 'spinner', 'wait', 'progress', 'busy']))
            dynamic_indicators['loading_indicators'] = [self._generate_selector(elem) for elem in loading_elements]
            
            # Look for dynamic containers
            dynamic_containers = soup.find_all(['div', 'span'], 
                id=lambda x: x and any(term in x.lower() for term in ['dynamic', 'ajax', 'content', 'result']))
            dynamic_indicators['dynamic_containers'] = [self._generate_selector(elem) for elem in dynamic_containers]
            
            self.site_map['dynamic'] = dynamic_indicators
            return dynamic_indicators
            
        except Exception as e:
            logger.error(f"Failed to detect dynamic elements: {e}")
            return {}
    
    def _generate_selector(self, element) -> str:
        """Generate CSS selector for an element with fallback options."""
        selectors = []
        
        # Try ID first (most specific)
        if element.get('id'):
            return f"#{element['id']}"
        
        # Try class names
        if element.get('class'):
            class_selector = '.' + '.'.join(element['class'])
            selectors.append(class_selector)
        
        # Try name attribute
        if element.get('name'):
            selectors.append(f"[name='{element['name']}']")
        
        # Try tag with attributes as fallback
        tag_selector = element.name
        if element.get('type'):
            tag_selector += f"[type='{element['type']}']"
        selectors.append(tag_selector)
        
        return selectors[0] if selectors else element.name
    
    def _find_csrf_token(self, form) -> Optional[str]:
        """Find CSRF token field in form."""
        csrf_fields = form.find_all('input', type='hidden')
        for field in csrf_fields:
            field_name = field.get('name', '').lower()
            if any(term in field_name for term in ['csrf', 'token', '_token']):
                return field.get('name')
        return None
    
    def _prepare_login_data(self, form, username: str, password: str) -> Dict[str, str]:
        """Prepare login data with all required fields."""
        login_data = {}
        
        # Find username and password fields
        username_field = None
        password_field = None
        
        for field in form.find_all(['input']):
            field_name = field.get('name', '').lower()
            field_type = field.get('type', '').lower()
            
            if field_type == 'password':
                password_field = field.get('name')
            elif any(term in field_name for term in ['user', 'email', 'login', 'username']):
                username_field = field.get('name')
        
        if username_field and password_field:
            login_data[username_field] = username
            login_data[password_field] = password
        
        # Add any hidden fields or CSRF tokens
        for hidden in form.find_all('input', type='hidden'):
            if hidden.get('name'):
                login_data[hidden['name']] = hidden.get('value', '')
        
        return login_data
    
    def _is_login_successful(self, response) -> bool:
        """Check if login was successful based on response."""
        # Check for redirect to dashboard/main page
        if response.status_code in [301, 302]:
            return True
        
        # Check for success indicators in response
        soup = BeautifulSoup(response.content, 'html.parser')
        success_indicators = soup.find_all(text=re.compile(r'welcome|dashboard|logout|sign out', re.I))
        error_indicators = soup.find_all(text=re.compile(r'error|invalid|failed|incorrect', re.I))
        
        return len(success_indicators) > 0 and len(error_indicators) == 0
    
    def save_site_map(self, filename: str) -> None:
        """Save the site map for use by Selenium."""
        with open(filename, 'w') as f:
            json.dump(self.site_map, f, indent=2)
        logger.info(f"Site map saved to {filename}")
    
    def load_site_map(self, filename: str) -> Dict[str, Any]:
        """Load previously mapped site structure."""
        with open(filename, 'r') as f:
            self.site_map = json.load(f)
        logger.info(f"Site map loaded from {filename}")
        return self.site_map
    
    def get_field_mappings(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create intelligent field mappings based on product details and form structure.
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
            'dimensions': ['dimensions', 'size', 'measurements', 'specs']
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
