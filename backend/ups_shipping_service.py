#!/usr/bin/env python3
"""
UPS Shipping Service
Handles UPS API integration for Tin Skinz shipping costs
"""

import logging
import os
import requests
import json
import base64
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class UPSShippingService:
    def __init__(self):
        # Use production URL by default, CIE for testing if specified
        # CIE URL: https://wwwcie.ups.com (for testing)
        # Production URL: https://onlinetools.ups.com
        self.base_url = os.getenv('UPS_BASE_URL', 'https://onlinetools.ups.com')
        self.client_id = os.getenv('UPS_CLIENT_ID')
        self.client_secret = os.getenv('UPS_CLIENT_SECRET')
        self.shipper_number = os.getenv('UPS_SHIPPER_NUMBER')
        self.access_token = None
        self.token_expires = None
        
    async def get_access_token(self) -> str:
        """Get UPS API access token"""
        try:
            if self.access_token and self.token_expires and datetime.now() < self.token_expires:
                return self.access_token
                
            url = f"{self.base_url}/security/v1/oauth/token"
            
            # Encode credentials in Base64 for Basic Authentication
            credentials = f"{self.client_id}:{self.client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'grant_type': 'client_credentials',
                'scope': 'rating'
            }
            
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            # Set expiration 5 minutes before actual expiration for safety
            expires_in = int(token_data.get('expires_in', 3600)) - 300
            self.token_expires = datetime.now() + timedelta(seconds=expires_in)
            
            logger.info("✅ UPS access token obtained successfully")
            return self.access_token
            
        except Exception as e:
            logger.error(f"❌ Error getting UPS access token: {e}")
            raise
    
    async def get_shipping_rates(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get UPS shipping rates for Tin Skinz orders
        
        Args:
            order_data: Order data including quantity, dimensions, weight
            customer_info: Customer shipping information
            
        Returns:
            Dict with success status and shipping options
        """
        try:
            logger.info("🚚 Getting UPS shipping rates for Tin Skinz order...")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Prepare UPS rate request
            rate_request = self._prepare_ups_rate_request(order_data, customer_info)
            
            # Make UPS API request
            url = f"{self.base_url}/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'BuyPrintz'
            }
            
            logger.info(f"🚚 Making UPS rate request to: {url}")
            logger.info(f"📦 Request headers: {headers}")
            logger.info(f"📋 Request body: {json.dumps(rate_request, indent=2)}")
            
            response = requests.post(url, headers=headers, json=rate_request)
            
            if response.status_code != 200:
                logger.error(f"❌ UPS API error: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            
            rate_response = response.json()
            
            # Parse UPS response into our format
            shipping_options = self._parse_ups_response(rate_response)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'carrier': 'UPS',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting UPS shipping rates: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    def _prepare_ups_rate_request(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare UPS rate request payload"""
        
        # Calculate total weight and dimensions for Tin Skinz order
        # Tin weights: Empty tin = 1.18oz (0.074 lbs), With candy = 3.11oz (0.194 lbs)
        tin_weight_empty = 0.074  # lbs per empty tin (1.18oz)
        tin_weight_with_candy = 0.194  # lbs per tin with candy (3.11oz)
        tin_length = 4.0  # inches
        tin_width = 4.0   # inches
        tin_height = 6.0  # inches
        
        total_quantity = order_data.get('total_quantity', 1)
        selected_designs = order_data.get('selected_designs', [])
        
        # Calculate total weight based on which tins have candy
        total_weight = 0
        tins_with_candy = 0
        tins_without_candy = 0
        
        for design in selected_designs:
            quantity = design.get('quantity', 1)
            has_candy = design.get('candy_id') is not None
            
            if has_candy:
                total_weight += tin_weight_with_candy * quantity
                tins_with_candy += quantity
            else:
                total_weight += tin_weight_empty * quantity
                tins_without_candy += quantity
        
        logger.info(f"📦 Tin Skinz weight calculation: {tins_with_candy} tins with candy ({tin_weight_with_candy}lbs each), {tins_without_candy} empty tins ({tin_weight_empty}lbs each), total weight: {total_weight:.3f}lbs")
        
        # Calculate package dimensions (assuming tins are packed efficiently)
        if total_quantity <= 4:
            # Small box for 1-4 tins
            package_length = tin_length * 2
            package_width = tin_width * 2
            package_height = tin_height
        elif total_quantity <= 12:
            # Medium box for 5-12 tins
            package_length = tin_length * 3
            package_width = tin_width * 2
            package_height = tin_height * 2
        else:
            # Large box for 13+ tins
            package_length = tin_length * 4
            package_width = tin_width * 3
            package_height = tin_height * 2
        
        # Ensure minimum dimensions for UPS
        package_length = max(package_length, 1.0)
        package_width = max(package_width, 1.0)
        package_height = max(package_height, 1.0)
        
        return {
            "RateRequest": {
                "Request": {
                    "RequestOption": "Rate",
                    "TransactionReference": {
                        "CustomerContext": f"Tin Skinz Order {total_quantity} tins"
                    }
                },
                "Shipment": {
                    "Shipper": {
                        "Name": "BuyPrintz",
                        "ShipperNumber": self.shipper_number,
                        "Address": {
                            "AddressLine": ["123 Business St"],
                            "City": "Boston",
                            "StateProvinceCode": "MA",
                            "PostalCode": "02101",
                            "CountryCode": "US"
                        }
                    },
                    "ShipFrom": {
                        "Name": "BuyPrintz",
                        "Address": {
                            "AddressLine": ["123 Business St"],
                            "City": "Boston",
                            "StateProvinceCode": "MA",
                            "PostalCode": "02101",
                            "CountryCode": "US"
                        }
                    },
                    "ShipTo": {
                        "Name": customer_info.get('name', 'Customer'),
                        "Address": {
                            "AddressLine": [customer_info.get('address', '')],
                            "City": customer_info.get('city', ''),
                            "StateProvinceCode": customer_info.get('state', ''),
                            "PostalCode": customer_info.get('zipCode', ''),
                            "CountryCode": "US"
                        }
                    },
                    "ShipFrom": {
                        "Name": "BuyPrintz",
                        "Address": {
                            "AddressLine": ["123 Business St"],
                            "City": "Boston",
                            "StateProvinceCode": "MA",
                            "PostalCode": "02101",
                            "CountryCode": "US"
                        }
                    },
                    "Service": {
                        "Code": "03",  # Ground
                        "Description": "UPS Ground"
                    },
                    "Package": {
                        "PackagingType": {
                            "Code": "02",  # Customer Supplied Package
                            "Description": "Package"
                        },
                        "Dimensions": {
                            "UnitOfMeasurement": {
                                "Code": "IN",
                                "Description": "Inches"
                            },
                            "Length": str(package_length),
                            "Width": str(package_width),
                            "Height": str(package_height)
                        },
                        "PackageWeight": {
                            "UnitOfMeasurement": {
                                "Code": "LBS",
                                "Description": "Pounds"
                            },
                            "Weight": str(total_weight)
                        }
                    }
                }
            }
        }
    
    def _parse_ups_response(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse UPS API response into our shipping options format"""
        shipping_options = []
        
        try:
            rate_response = response.get('RateResponse', {})
            rated_shipment = rate_response.get('RatedShipment', [])
            
            if not isinstance(rated_shipment, list):
                rated_shipment = [rated_shipment]
            
            for shipment in rated_shipment:
                service = shipment.get('Service', {})
                total_charges = shipment.get('TotalCharges', {})
                
                service_code = service.get('Code', '')
                service_name = service.get('Description', 'UPS Service')
                cost = float(total_charges.get('MonetaryValue', 0))
                
                # Map UPS service codes to friendly names
                service_mapping = {
                    '01': 'UPS Next Day Air',
                    '02': 'UPS 2nd Day Air',
                    '03': 'UPS Ground',
                    '12': 'UPS 3 Day Select',
                    '13': 'UPS Next Day Air Saver',
                    '14': 'UPS Next Day Air Early',
                    '59': 'UPS 2nd Day Air A.M.',
                    '65': 'UPS Saver'
                }
                
                friendly_name = service_mapping.get(service_code, service_name)
                
                shipping_options.append({
                    'id': f'ups_{service_code}',
                    'name': friendly_name,
                    'type': service_code,
                    'cost': cost,
                    'carrier': 'UPS',
                    'estimated_days': self._get_estimated_delivery_days(service_code)
                })
            
            # Sort by cost (cheapest first)
            shipping_options.sort(key=lambda x: x['cost'])
            
            logger.info(f"✅ Parsed {len(shipping_options)} UPS shipping options")
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error parsing UPS response: {e}")
            return []
    
    def _get_estimated_delivery_days(self, service_code: str) -> int:
        """Get estimated delivery days for UPS service"""
        delivery_days = {
            '01': 1,  # Next Day Air
            '02': 2,  # 2nd Day Air
            '03': 5,  # Ground
            '12': 3,  # 3 Day Select
            '13': 1,  # Next Day Air Saver
            '14': 1,  # Next Day Air Early
            '59': 2,  # 2nd Day Air A.M.
            '65': 1   # Saver
        }
        return delivery_days.get(service_code, 5)
    
    async def get_single_service_rate(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get rate for a single UPS service (Ground)"""
        try:
            logger.info("🚚 Getting single UPS service rate...")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Prepare UPS rate request
            rate_request = self._prepare_ups_rate_request(order_data, customer_info)
            
            # Make UPS API request
            url = f"{self.base_url}/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'BuyPrintz'
            }
            
            logger.info(f"🚚 Making UPS rate request to: {url}")
            logger.info(f"📦 Request headers: {headers}")
            logger.info(f"📋 Request body: {json.dumps(rate_request, indent=2)}")
            
            response = requests.post(url, headers=headers, json=rate_request)
            
            if response.status_code != 200:
                logger.error(f"❌ UPS API error: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            
            rate_response = response.json()
            
            # Parse UPS response into our format
            shipping_options = self._parse_ups_response(rate_response)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'carrier': 'UPS',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting single UPS service rate: {e}")
            return {
                'success': False,
                'shipping_options': [],
                'carrier': 'UPS',
                'errors': [str(e)],
                'timestamp': datetime.now().isoformat()
            }

    async def get_multiple_service_rates(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get rates for multiple UPS services"""
        try:
            logger.info("🚚 Getting multiple UPS service rates...")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Prepare request for multiple services
            rate_request = self._prepare_multi_service_request(order_data, customer_info)
            
            # Make UPS API request
            url = f"{self.base_url}/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-multi-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'BuyPrintz'
            }
            
            response = requests.post(url, headers=headers, json=rate_request)
            response.raise_for_status()
            
            rate_response = response.json()
            
            # Parse UPS response
            shipping_options = self._parse_ups_response(rate_response)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'carrier': 'UPS',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting multiple UPS service rates: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    def _prepare_multi_service_request(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare UPS request for multiple services"""
        base_request = self._prepare_ups_rate_request(order_data, customer_info)
        
        # Add multiple services
        services = [
            {'Code': '03', 'Description': 'UPS Ground'},
            {'Code': '12', 'Description': 'UPS 3 Day Select'},
            {'Code': '02', 'Description': 'UPS 2nd Day Air'},
            {'Code': '01', 'Description': 'UPS Next Day Air'}
        ]
        
        # Create separate shipments for each service
        shipments = []
        for service in services:
            shipment = base_request['RateRequest']['Shipment'].copy()
            shipment['Service'] = service
            shipments.append(shipment)
        
        return {
            "RateRequest": {
                "Request": base_request['RateRequest']['Request'],
                "Shipment": shipments
            }
        }

# Create singleton instance
ups_shipping_service = UPSShippingService()
