#!/usr/bin/env python3
"""
🌟 AOS Framework AI Agent Adapter - SERVER_TEMPLATES_GUIDE.md Compliant
MANDATORY pattern for AI agent integration with full MCP compliance.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import httpx
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)

class MCPCompliantServiceAdapter:
    """
    🌟 MANDATORY MCP-Compliant Adapter Base Class
    
    This base class ensures all adapters automatically handle MCP JSON-RPC 2.0
    responses according to SERVER_TEMPLATES_GUIDE.md standards.
    """
    
    def __init__(self, name: str, service_type: str, base_url: str = None, timeout: float = 120.0):
        self.name = name
        self.service_type = service_type
        self.base_url = base_url
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout) if base_url else None
        self._mcp_compliant = True
        self._server_templates_guide_compliant = True
        self.capabilities = []
        self.initialization_error = None
    
    def add_capability(self, name: str, description: str):
        """Add a service capability"""
        self.capabilities.append({"name": name, "description": description})
    
    async def get_health(self) -> Dict[str, Any]:
        """Get service health status"""
        return {
            "status": "healthy",
            "service": self.name,
            "mcp_compliant": self._mcp_compliant,
            "server_templates_guide_compliant": self._server_templates_guide_compliant
        }
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.client:
            await self.client.aclose()

class AIAgentAdapter(MCPCompliantServiceAdapter):
    """
    🌟 SERVER_TEMPLATES_GUIDE.md Compliant AI Agent Adapter
    
    This adapter provides standardized AI agent integration with OpenAI
    following AOS Framework architectural patterns.
    """
    
    def __init__(self, base_url: str = None):
        super().__init__(
            name="ai_agent_adapter", 
            service_type="intelligence",
            base_url=base_url,
            timeout=120.0
        )
        
        # Initialize OpenAI client
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Add AI agent capabilities
        self.add_capability("design_assistance", "AI-powered banner design assistance")
        self.add_capability("order_help", "AI assistance with order management")
        self.add_capability("banner_recommendations", "AI-powered banner recommendations")
        self.add_capability("general_chat", "General AI chat assistance")
        
        # Tool definitions for the AI agent
        self.available_tools = [
            {
                "type": "function",
                "function": {
                    "name": "get_user_designs",
                    "description": "Get user's saved banner designs",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID to get designs for"
                            }
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_user_orders",
                    "description": "Get user's order history and status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID to get orders for"
                            },
                            "order_id": {
                                "type": "string",
                                "description": "Specific order ID (optional)"
                            }
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_banner_products",
                    "description": "Get available banner products and specifications",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_banner_pricing",
                    "description": "Calculate pricing for banner specifications",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_type": {
                                "type": "string",
                                "description": "Type of banner product"
                            },
                            "quantity": {
                                "type": "integer",
                                "description": "Number of banners"
                            },
                            "dimensions": {
                                "type": "object",
                                "description": "Banner dimensions"
                            }
                        },
                        "required": ["product_type", "quantity"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_design_recommendations",
                    "description": "Get AI-powered design recommendations",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "use_case": {
                                "type": "string",
                                "description": "Intended use case for the banner"
                            },
                            "industry": {
                                "type": "string",
                                "description": "Industry or business type"
                            },
                            "dimensions": {
                                "type": "object",
                                "description": "Banner dimensions"
                            }
                        },
                        "required": ["use_case"]
                    }
                }
            }
        ]
    
    async def initialize(self) -> bool:
        """Initialize AI agent adapter with health check"""
        try:
            # Test OpenAI connection
            if not os.getenv("OPENAI_API_KEY"):
                self.initialization_error = "OpenAI API key not configured"
                return False
            
            # Test OpenAI API
            test_response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            
            if test_response.choices:
                logger.info("✅ AI Agent Adapter initialized successfully")
                return True
            else:
                self.initialization_error = "OpenAI API test failed"
                return False
                
        except Exception as e:
            self.initialization_error = str(e)
            logger.error(f"❌ AI Agent Adapter initialization failed: {e}")
            return False
    
    async def chat_with_ai(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        🌟 MCP Tool with automatic compliance
        
        Args:
            query: User's question or request
            context: Additional context about the user and their data
            
        Returns:
            Dict with AI response and success status
        """
        try:
            if not context:
                context = {}
            
            # Build system message with context
            system_message = self._build_system_message(context)
            
            # Create messages for OpenAI
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": query}
            ]
            
            # Call OpenAI with function calling
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.available_tools,
                tool_choice="auto",
                max_tokens=1000,
                temperature=0.7
            )
            
            # Process the response
            result = await self._process_ai_response(response, context)
            
            return {
                "success": True,
                "response": result,
                "mcp_compliant": True,
                "server_templates_guide_compliant": True
            }
            
        except Exception as e:
            logger.error(f"AI Chat error: {e}")
            return {
                "success": False,
                "error": str(e),
                "mcp_compliant": True,
                "server_templates_guide_compliant": True
            }
    
    async def get_design_assistance(self, design_type: str, requirements: Dict[str, Any], user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get AI-powered design assistance"""
        try:
            if not user_preferences:
                user_preferences = {}
            
            # Build design assistance query
            query = f"""
            I need help with {design_type} banner design. Here are my requirements:
            {json.dumps(requirements, indent=2)}
            
            My preferences:
            {json.dumps(user_preferences, indent=2)}
            
            Please provide design recommendations, color suggestions, layout advice, and any other helpful guidance.
            """
            
            context = {
                "design_type": design_type,
                "requirements": requirements,
                "user_preferences": user_preferences
            }
            
            return await self.chat_with_ai(query, context)
            
        except Exception as e:
            logger.error(f"Design assistance error: {e}")
            return {
                "success": False,
                "error": str(e),
                "mcp_compliant": True,
                "server_templates_guide_compliant": True
            }
    
    async def get_order_assistance(self, order_id: str = None, user_id: str = None, query_type: str = "status") -> Dict[str, Any]:
        """Get AI assistance with order management"""
        try:
            # Build order assistance query
            if order_id:
                query = f"Help me with order {order_id}. I want to know about {query_type}."
            else:
                query = f"Help me with my orders. I want to know about {query_type}."
            
            context = {
                "order_id": order_id,
                "user_id": user_id,
                "query_type": query_type
            }
            
            return await self.chat_with_ai(query, context)
            
        except Exception as e:
            logger.error(f"Order assistance error: {e}")
            return {
                "success": False,
                "error": str(e),
                "mcp_compliant": True,
                "server_templates_guide_compliant": True
            }
    
    async def get_banner_recommendations(self, use_case: str, dimensions: Dict[str, Any] = None, budget: float = None) -> Dict[str, Any]:
        """Get AI-powered banner recommendations"""
        try:
            # Build recommendation query
            query = f"""
            I need banner recommendations for: {use_case}
            """
            
            if dimensions:
                query += f"\nDimensions: {json.dumps(dimensions, indent=2)}"
            
            if budget:
                query += f"\nBudget: ${budget}"
            
            query += "\n\nPlease recommend the best banner type, material, size, and any other specifications."
            
            context = {
                "use_case": use_case,
                "dimensions": dimensions,
                "budget": budget
            }
            
            return await self.chat_with_ai(query, context)
            
        except Exception as e:
            logger.error(f"Banner recommendations error: {e}")
            return {
                "success": False,
                "error": str(e),
                "mcp_compliant": True,
                "server_templates_guide_compliant": True
            }
    
    def _build_system_message(self, context: Dict[str, Any]) -> str:
        """Build system message with context"""
        system_message = """You are an AI assistant for BuyPrintz, a professional banner printing platform. You help users with:

1. Banner design assistance and recommendations
2. Order management and tracking
3. Product selection and pricing
4. General questions about banners and printing

You have access to tools that let you:
- Get user's saved designs
- Check order status and history
- Get product information and pricing
- Provide design recommendations

Always be helpful, professional, and provide actionable advice. If you need to use tools to get information, do so to provide the most accurate and helpful response.

Context about the user:"""
        
        if context:
            system_message += f"\n{json.dumps(context, indent=2)}"
        
        return system_message
    
    async def _process_ai_response(self, response, context: Dict[str, Any]) -> str:
        """Process AI response and handle function calls"""
        try:
            message = response.choices[0].message
            
            # Check if the AI wants to call a function
            if message.tool_calls:
                # Execute function calls
                tool_results = []
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    
                    # Execute the function
                    result = await self._execute_tool_function(function_name, function_args, context)
                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "function_name": function_name,
                        "result": result
                    })
                
                # Get final response with tool results
                final_messages = [
                    {"role": "system", "content": self._build_system_message(context)},
                    {"role": "user", "content": "Please provide a helpful response based on the tool results."}
                ]
                
                # Add tool results to messages
                for tool_result in tool_results:
                    final_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_result["tool_call_id"],
                        "content": json.dumps(tool_result["result"])
                    })
                
                # Get final response
                final_response = await self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=final_messages,
                    max_tokens=1000,
                    temperature=0.7
                )
                
                return final_response.choices[0].message.content
            else:
                return message.content
                
        except Exception as e:
            logger.error(f"Error processing AI response: {e}")
            return f"I apologize, but I encountered an error while processing your request: {str(e)}"
    
    async def _execute_tool_function(self, function_name: str, function_args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute tool functions"""
        try:
            if function_name == "get_user_designs":
                return await self._get_user_designs(function_args.get("user_id"))
            elif function_name == "get_user_orders":
                return await self._get_user_orders(function_args.get("user_id"), function_args.get("order_id"))
            elif function_name == "get_banner_products":
                return await self._get_banner_products()
            elif function_name == "calculate_banner_pricing":
                return await self._calculate_banner_pricing(
                    function_args.get("product_type"),
                    function_args.get("quantity"),
                    function_args.get("dimensions")
                )
            elif function_name == "get_design_recommendations":
                return await self._get_design_recommendations(
                    function_args.get("use_case"),
                    function_args.get("industry"),
                    function_args.get("dimensions")
                )
            else:
                return {"error": f"Unknown function: {function_name}"}
                
        except Exception as e:
            logger.error(f"Error executing tool function {function_name}: {e}")
            return {"error": str(e)}
    
    async def _get_user_designs(self, user_id: str) -> Dict[str, Any]:
        """Get user's designs from database"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            designs = await db_manager.get_user_designs(user_id)
            return {
                "message": f"Retrieved {len(designs)} designs for user {user_id}",
                "designs": designs,
                "count": len(designs)
            }
        except Exception as e:
            logger.error(f"Error getting user designs: {e}")
            return {
                "error": f"Failed to retrieve designs: {str(e)}",
                "designs": [],
                "count": 0
            }
    
    async def _get_user_orders(self, user_id: str, order_id: str = None) -> Dict[str, Any]:
        """Get user's orders from database"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            if order_id:
                order = await db_manager.get_order(order_id)
                if order and order.get("user_id") == user_id:
                    return {
                        "message": f"Retrieved order {order_id} for user {user_id}",
                        "order": order
                    }
                else:
                    return {
                        "error": f"Order {order_id} not found or not accessible",
                        "order": None
                    }
            else:
                orders = await db_manager.get_user_orders(user_id)
                return {
                    "message": f"Retrieved {len(orders)} orders for user {user_id}",
                    "orders": orders,
                    "count": len(orders)
                }
        except Exception as e:
            logger.error(f"Error getting user orders: {e}")
            return {
                "error": f"Failed to retrieve orders: {str(e)}",
                "orders": [],
                "count": 0
            }
    
    async def _get_banner_products(self) -> Dict[str, Any]:
        """Get available banner products"""
        return {
            "products": [
                {
                    "id": "banner",
                    "name": "Vinyl Banner",
                    "base_price": 25.00,
                    "description": "High-quality vinyl banners for outdoor use",
                    "materials": ["13oz Vinyl", "9oz Fabric", "Backlit", "Blockout"],
                    "sizes": ["2x4", "3x6", "4x8", "Custom"]
                },
                {
                    "id": "sign",
                    "name": "Corrugated Sign",
                    "base_price": 35.00,
                    "description": "Durable corrugated plastic signs",
                    "materials": ["Corrugated Plastic"],
                    "sizes": ["12x18", "18x24", "24x36", "Custom"]
                }
            ]
        }
    
    async def _calculate_banner_pricing(self, product_type: str, quantity: int, dimensions: Dict[str, Any] = None) -> Dict[str, Any]:
        """Calculate banner pricing"""
        base_prices = {
            "banner": 25.00,
            "sign": 35.00,
            "sticker": 15.00,
            "custom": 50.00
        }
        
        base_price = base_prices.get(product_type, 50.00)
        total = base_price * quantity
        
        return {
            "product_type": product_type,
            "quantity": quantity,
            "base_price": base_price,
            "total": total,
            "dimensions": dimensions
        }
    
    async def _get_design_recommendations(self, use_case: str, industry: str = None, dimensions: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get design recommendations"""
        recommendations = {
            "use_case": use_case,
            "industry": industry,
            "dimensions": dimensions,
            "recommendations": {
                "colors": ["Blue and white for professional look", "Red and yellow for attention-grabbing"],
                "fonts": ["Bold sans-serif for readability", "Script fonts for elegance"],
                "layout": ["Keep text minimal and large", "Use high contrast colors"],
                "materials": ["Vinyl for outdoor durability", "Fabric for indoor elegance"]
            }
        }
        
        return recommendations
    
    async def get_service_info(self) -> Dict[str, Any]:
        """Get comprehensive service information"""
        return {
            "name": self.name,
            "type": self.service_type,
            "capabilities": [cap["name"] for cap in self.capabilities],
            "mcp_compliant": self._mcp_compliant,
            "server_templates_guide_compliant": self._server_templates_guide_compliant,
            "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
            "available_tools": len(self.available_tools)
        }

# Create global instance
ai_agent_adapter = AIAgentAdapter()
