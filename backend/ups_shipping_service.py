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
        self.username = os.getenv('UPS_USERNAME')
        self.password = os.getenv('UPS_PASSWORD')
        self.access_token = None
        self.token_expires = None
        
    async def get_access_token(self) -> str:
        """Get UPS API access token"""
        try:
            if self.access_token and self.token_expires and datetime.now() < self.token_expires:
                return self.access_token
                
            # Use production endpoint
            url = "https://onlinetools.ups.com/security/v1/oauth/token"
            
            # Use Basic Authentication with username/password as per UPS OAuth documentation
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'grant_type': 'client_credentials'
            }
            
            logger.info(f"🔐 Making OAuth token request to: {url}")
            logger.info(f"👤 Using client_id: {self.client_id}")
            logger.info(f"📋 Request data: {data}")
            
            response = requests.post(url, headers=headers, data=data, auth=(self.client_id, self.client_secret))
            
            if response.status_code != 200:
                logger.error(f"❌ OAuth token request failed: {response.status_code} - {response.text}")
            
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
            url = "https://onlinetools.ups.com/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'testing'
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
                    "PaymentDetails": {
                        "ShipmentCharge": [
                            {
                                "Type": "01",
                                "BillShipper": {
                                    "AccountNumber": self.shipper_number
                                }
                            }
                        ]
                    },
                    "Service": {
                        "Code": "03",  # Ground
                        "Description": "Ground"
                    },
                    "NumOfPieces": "1",
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
    
    async def track_shipment(self, tracking_number: str) -> Dict[str, Any]:
        """Track a UPS shipment using tracking number"""
        try:
            logger.info(f"📦 Tracking UPS shipment: {tracking_number}")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Make UPS tracking request
            url = f"https://onlinetools.ups.com/api/track/v1/details/{tracking_number}"
            
            headers = {
                'transId': f'tin-skinz-track-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'testing',
                'Authorization': f'Bearer {access_token}'
            }
            
            query_params = {
                'locale': 'en_US',
                'returnSignature': 'false',
                'returnMilestones': 'false',
                'returnPOD': 'false'
            }
            
            logger.info(f"📦 Making UPS tracking request to: {url}")
            logger.info(f"📋 Request headers: {headers}")
            logger.info(f"📋 Query params: {query_params}")
            
            response = requests.get(url, headers=headers, params=query_params)
            
            if response.status_code != 200:
                logger.error(f"❌ UPS tracking API error: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            
            tracking_response = response.json()
            
            # Parse UPS tracking response
            tracking_info = self._parse_ups_tracking_response(tracking_response)
            
            return {
                'success': True,
                'tracking_info': tracking_info,
                'carrier': 'UPS',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error tracking UPS shipment: {e}")
            return {
                'success': False,
                'tracking_info': None,
                'carrier': 'UPS',
                'errors': [str(e)],
                'timestamp': datetime.now().isoformat()
            }

    def _parse_ups_tracking_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse UPS tracking response into our format"""
        try:
            logger.info(f"📦 Parsing UPS tracking response: {response}")
            
            # Handle different response formats
            if isinstance(response, str):
                # If response is a string, try to parse it as JSON
                try:
                    response = json.loads(response)
                except json.JSONDecodeError:
                    return {
                        'tracking_number': '',
                        'status': 'Invalid response format',
                        'error': 'Response is not valid JSON'
                    }
            
            # Extract tracking information from UPS response
            if 'trackResponse' in response:
                track_response = response['trackResponse']
                
                # Handle shipment data
                if 'shipment' in track_response:
                    shipment = track_response['shipment']
                    
                    # Handle both single shipment and array of shipments
                    if isinstance(shipment, list) and len(shipment) > 0:
                        shipment = shipment[0]
                    elif not isinstance(shipment, dict):
                        return {
                            'tracking_number': '',
                            'status': 'No shipment data available',
                            'error': 'Invalid shipment format'
                        }
                    
                    # Get package details
                    package = shipment.get('package', {})
                    if isinstance(package, list) and len(package) > 0:
                        package = package[0]
                    
                    # Get current status from currentStatus field (not activity)
                    current_status = package.get('currentStatus', {})
                    
                    # Get delivery information
                    delivery_info = package.get('deliveryInformation', {})
                    
                    # Get package details
                    package_weight = package.get('weight', {})
                    
                    # Get service information
                    service = package.get('service', {})
                    
                    # Get activities (tracking history)
                    activities = package.get('activity', [])
                    
                    # Build location string from delivery info
                    location = delivery_info.get('location', '')
                    
                    # Get delivery date and time
                    delivery_date = ''
                    delivery_time = ''
                    if package.get('deliveryDate') and len(package['deliveryDate']) > 0:
                        delivery_date = package['deliveryDate'][0].get('date', '')
                    
                    if package.get('deliveryTime'):
                        delivery_time = package['deliveryTime'].get('startTime', '')
                    
                    return {
                        'tracking_number': shipment.get('inquiryNumber', ''),
                        'status': current_status.get('description', 'Unknown'),
                        'status_code': current_status.get('code', ''),
                        'location': location,
                        'timestamp': f"{current_status.get('date', '')} {current_status.get('time', '')}".strip(),
                        'delivery_date': delivery_date,
                        'delivery_time': delivery_time,
                        'weight': package_weight.get('weight', ''),
                        'service': service.get('description', ''),
                        'activities': [
                            {
                                'status': activity.get('status', {}).get('description', '') if activity.get('status') else '',
                                'location': activity.get('location', {}).get('address', {}).get('city', '') + ', ' + activity.get('location', {}).get('address', {}).get('stateProvinceCode', '') if activity.get('location', {}).get('address') else '',
                                'timestamp': f"{activity.get('date', '')} {activity.get('time', '')}".strip()
                            }
                            for activity in activities if activity.get('status') or activity.get('location')
                        ]
                    }
                else:
                    return {
                        'tracking_number': '',
                        'status': 'No shipment data available',
                        'error': 'No shipment in response'
                    }
            else:
                return {
                    'tracking_number': '',
                    'status': 'No tracking information available',
                    'error': 'Invalid response format - no trackResponse'
                }
                
        except Exception as e:
            logger.error(f"❌ Error parsing UPS tracking response: {e}")
            logger.error(f"📦 Raw response: {response}")
            return {
                'tracking_number': '',
                'status': 'Error parsing tracking information',
                'error': str(e)
            }

    async def create_shipment(self, order_data: Dict[str, Any], customer_info: Dict[str, Any], service_code: str = "03") -> Dict[str, Any]:
        """Create a UPS shipment and get tracking number"""
        try:
            logger.info(f"📦 Creating UPS shipment for {order_data.get('total_quantity', 0)} tins...")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Calculate package dimensions and weight
            total_quantity = order_data.get('total_quantity', 1)
            package_length, package_width, package_height, total_weight = self._calculate_package_details(order_data)
            
            # Prepare UPS shipment request
            shipment_request = {
                "ShipmentRequest": {
                    "Request": {
                        "SubVersion": "1801",
                        "RequestOption": "nonvalidate",
                        "TransactionReference": {
                            "CustomerContext": f"Tin Skinz Order {total_quantity} tins"
                        }
                    },
                    "Shipment": {
                        "Description": f"Tin Skinz Order - {total_quantity} tins",
                        "Shipper": {
                            "Name": "BuyPrintz",
                            "AttentionName": "BuyPrintz Shipping",
                            "Phone": {
                                "Number": "5551234567"
                            },
                            "ShipperNumber": self.shipper_number,
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
                            "AttentionName": customer_info.get('name', 'Customer'),
                            "Phone": {
                                "Number": customer_info.get('phone', '5551234567')
                            },
                            "Address": {
                                "AddressLine": [customer_info.get('address', '')],
                                "City": customer_info.get('city', ''),
                                "StateProvinceCode": customer_info.get('state', ''),
                                "PostalCode": customer_info.get('zipCode', ''),
                                "CountryCode": "US"
                            },
                            "Residential": "true"
                        },
                        "ShipFrom": {
                            "Name": "BuyPrintz",
                            "AttentionName": "BuyPrintz Shipping",
                            "Phone": {
                                "Number": "5551234567"
                            },
                            "Address": {
                                "AddressLine": ["123 Business St"],
                                "City": "Boston",
                                "StateProvinceCode": "MA",
                                "PostalCode": "02101",
                                "CountryCode": "US"
                            }
                        },
                        "PaymentInformation": {
                            "ShipmentCharge": {
                                "Type": "01",
                                "BillShipper": {
                                    "AccountNumber": self.shipper_number
                                }
                            }
                        },
                        "Service": {
                            "Code": service_code,
                            "Description": "Ground"
                        },
                        "Package": {
                            "Description": f"Tin Skinz Order - {total_quantity} tins",
                            "Packaging": {
                                "Code": "02",
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
                    },
                    "LabelSpecification": {
                        "LabelImageFormat": {
                            "Code": "GIF",
                            "Description": "GIF"
                        },
                        "HTTPUserAgent": "BuyPrintz-TinSkinz/1.0"
                    }
                }
            }
            
            # Make UPS shipment request
            url = f"https://onlinetools.ups.com/api/shipments/v2409/ship"
            
            headers = {
                'Content-Type': 'application/json',
                'transId': f'tin-skinz-ship-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'testing',
                'Authorization': f'Bearer {access_token}'
            }
            
            logger.info(f"📦 Making UPS shipment request to: {url}")
            logger.info(f"📋 Request headers: {headers}")
            logger.info(f"📋 Request body: {json.dumps(shipment_request, indent=2)}")
            
            response = requests.post(url, headers=headers, json=shipment_request)
            
            if response.status_code != 200:
                logger.error(f"❌ UPS shipment API error: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            
            shipment_response = response.json()
            
            # Parse UPS shipment response
            shipment_info = self._parse_ups_shipment_response(shipment_response)
            
            return {
                'success': True,
                'shipment_info': shipment_info,
                'carrier': 'UPS',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error creating UPS shipment: {e}")
            return {
                'success': False,
                'shipment_info': None,
                'carrier': 'UPS',
                'errors': [str(e)],
                'timestamp': datetime.now().isoformat()
            }

    def _calculate_package_details(self, order_data: Dict[str, Any]) -> tuple:
        """Calculate package dimensions and weight for Tin Skinz order"""
        try:
            total_quantity = order_data.get('total_quantity', 1)
            selected_designs = order_data.get('selected_designs', [])
            
            # Calculate total weight
            total_weight = 0.0
            for design in selected_designs:
                quantity = design.get('quantity', 1)
                candy_id = design.get('candy_id')
                
                if candy_id:
                    # Tin with candy: 0.194 lbs each
                    total_weight += quantity * 0.194
                else:
                    # Empty tin: 0.074 lbs each
                    total_weight += quantity * 0.074
            
            # Calculate package dimensions based on quantity
            # Assume tins are roughly 3" x 3" x 2" each
            # Package dimensions will scale with quantity
            if total_quantity <= 4:
                # Small package: 8" x 8" x 6"
                package_length = 8.0
                package_width = 8.0
                package_height = 6.0
            elif total_quantity <= 12:
                # Medium package: 12" x 12" x 8"
                package_length = 12.0
                package_width = 12.0
                package_height = 8.0
            else:
                # Large package: 16" x 16" x 10"
                package_length = 16.0
                package_width = 16.0
                package_height = 10.0
            
            logger.info(f"📦 Package details: {total_quantity} tins, {total_weight:.3f} lbs, {package_length}x{package_width}x{package_height} inches")
            
            return package_length, package_width, package_height, total_weight
            
        except Exception as e:
            logger.error(f"❌ Error calculating package details: {e}")
            # Return default values
            return 8.0, 8.0, 6.0, 0.5

    def _parse_ups_shipment_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse UPS shipment response into our format"""
        try:
            logger.info(f"📦 Parsing UPS shipment response: {response}")
            
            # Extract shipment information from UPS response
            if 'ShipmentResponse' in response:
                shipment_response = response['ShipmentResponse']
                
                # Get shipment results
                shipment_results = shipment_response.get('ShipmentResults', {})
                
                # Get package results
                package_results = shipment_results.get('PackageResults', {})
                
                # Get tracking number
                tracking_number = package_results.get('TrackingNumber', '')
                
                # Get label information
                label_results = package_results.get('LabelImage', {})
                label_format = label_results.get('GraphicImage', '')
                
                # Get shipping cost
                shipment_charges = shipment_results.get('ShipmentCharges', {})
                total_charges = shipment_charges.get('TotalCharges', {})
                shipping_cost = total_charges.get('MonetaryValue', '0.00')
                
                return {
                    'tracking_number': tracking_number,
                    'label_image': label_format,
                    'shipping_cost': shipping_cost,
                    'service_code': shipment_results.get('Service', {}).get('Code', ''),
                    'service_description': shipment_results.get('Service', {}).get('Description', ''),
                    'shipment_date': shipment_results.get('ShipmentDate', ''),
                    'delivery_date': shipment_results.get('DeliveryDate', ''),
                    'package_count': shipment_results.get('PackageCount', 1)
                }
            else:
                return {
                    'tracking_number': '',
                    'label_image': '',
                    'shipping_cost': '0.00',
                    'error': 'Invalid response format'
                }
                
        except Exception as e:
            logger.error(f"❌ Error parsing UPS shipment response: {e}")
            return {
                'tracking_number': '',
                'label_image': '',
                'shipping_cost': '0.00',
                'error': str(e)
            }

    async def get_single_service_rate(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get rate for a single UPS service (Ground)"""
        try:
            logger.info("🚚 Getting single UPS service rate...")
            
            # Get access token
            access_token = await self.get_access_token()
            
            # Prepare UPS rate request
            rate_request = self._prepare_ups_rate_request(order_data, customer_info)
            
            # Make UPS API request
            url = "https://onlinetools.ups.com/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'testing'
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
            url = "https://onlinetools.ups.com/api/rating/v1/Rate"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {access_token}',
                'transId': f'tin-skinz-multi-{datetime.now().strftime("%Y%m%d%H%M%S")}',
                'transactionSrc': 'testing'
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
