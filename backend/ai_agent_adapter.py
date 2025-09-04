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
        
        # Initialize OpenAI client lazily (only when needed)
        self.openai_client = None
        self._initialized = False
        
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
                    "name": "create_banner_design",
                    "description": "Create a new banner design programmatically",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID to create design for"
                            },
                            "design_spec": {
                                "type": "object",
                                "description": "Design specification including elements, colors, text, etc.",
                                "properties": {
                                    "title": {"type": "string", "description": "Banner title/name"},
                                    "background_color": {"type": "string", "description": "Background color (hex code)"},
                                    "elements": {
                                        "type": "array",
                                        "description": "Array of design elements",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "type": {"type": "string", "enum": ["text", "shape", "image", "icon"]},
                                                "content": {"type": "string", "description": "Text content or element description"},
                                                "position": {"type": "object", "description": "X, Y coordinates"},
                                                "size": {"type": "object", "description": "Width, height"},
                                                "color": {"type": "string", "description": "Element color"},
                                                "font_size": {"type": "number", "description": "Font size for text elements"},
                                                "font_family": {"type": "string", "description": "Font family for text elements"}
                                            }
                                        }
                                    },
                                    "dimensions": {
                                        "type": "object",
                                        "properties": {
                                            "width": {"type": "number"},
                                            "height": {"type": "number"}
                                        }
                                    }
                                }
                            }
                        },
                        "required": ["user_id", "design_spec"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "modify_banner_design",
                    "description": "Modify an existing banner design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID"
                            },
                            "design_id": {
                                "type": "string",
                                "description": "Design ID to modify"
                            },
                            "modifications": {
                                "type": "object",
                                "description": "Modifications to apply to the design"
                            }
                        },
                        "required": ["user_id", "design_id", "modifications"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_element_to_design",
                    "description": "Add a new element to a banner design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID"
                            },
                            "design_id": {
                                "type": "string",
                                "description": "Design ID to modify"
                            },
                            "element": {
                                "type": "object",
                                "description": "Element to add",
                                "properties": {
                                    "type": {"type": "string", "enum": ["text", "shape", "image", "icon"]},
                                    "content": {"type": "string"},
                                    "position": {"type": "object"},
                                    "size": {"type": "object"},
                                    "color": {"type": "string"},
                                    "font_size": {"type": "number"},
                                    "font_family": {"type": "string"}
                                }
                            }
                        },
                        "required": ["user_id", "design_id", "element"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "generate_banner_from_prompt",
                    "description": "Generate a complete banner design from a text prompt",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {
                                "type": "string",
                                "description": "User ID"
                            },
                            "prompt": {
                                "type": "string",
                                "description": "Text description of the banner to create"
                            },
                            "style": {
                                "type": "string",
                                "description": "Design style (e.g., 'modern', 'vintage', 'corporate', 'creative')"
                            },
                            "dimensions": {
                                "type": "object",
                                "description": "Banner dimensions"
                            }
                        },
                        "required": ["user_id", "prompt"]
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
            # Check if OpenAI API key is configured
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                self.initialization_error = "OpenAI API key not configured"
                return False
            
            # Initialize OpenAI client
            self.openai_client = AsyncOpenAI(
                api_key=api_key,
                http_client=httpx.AsyncClient()
            )
            
            # Test OpenAI API
            test_response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            
            if test_response.choices:
                self._initialized = True
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
            # Ensure OpenAI client is initialized
            if not self._initialized or not self.openai_client:
                logger.info("AI Agent not initialized, attempting initialization...")
                initialized = await self.initialize()
                if not initialized:
                    logger.error(f"AI Agent initialization failed: {self.initialization_error}")
                    return {
                        "response": "AI Agent is not available. Please check configuration.",
                        "error": self.initialization_error
                    }
                logger.info("AI Agent initialized successfully!")
            
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
            logger.info(f"Calling OpenAI with {len(self.available_tools)} tools available")
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=self.available_tools,
                tool_choice="auto",
                max_tokens=1000,
                temperature=0.7
            )
            
            logger.info(f"OpenAI response: {response.choices[0].message}")
            
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
            # Ensure OpenAI client is initialized
            if not self._initialized or not self.openai_client:
                initialized = await self.initialize()
                if not initialized:
                    return {
                        "response": "AI Agent is not available. Please check configuration.",
                        "error": self.initialization_error
                    }
            
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
            # Ensure OpenAI client is initialized
            if not self._initialized or not self.openai_client:
                initialized = await self.initialize()
                if not initialized:
                    return {
                        "response": "AI Agent is not available. Please check configuration.",
                        "error": self.initialization_error
                    }
            
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
            # Ensure OpenAI client is initialized
            if not self._initialized or not self.openai_client:
                initialized = await self.initialize()
                if not initialized:
                    return {
                        "response": "AI Agent is not available. Please check configuration.",
                        "error": self.initialization_error
                    }
            
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
5. Creating new banner designs from text descriptions
6. Modifying existing banner designs
7. Adding elements to banners

You have access to tools that let you:
- Get user's saved designs
- Check order status and history
- Get product information and pricing
- Provide design recommendations
- Create new banner designs programmatically
- Modify existing banner designs
- Add elements (text, shapes, icons) to designs
- Generate complete banners from text prompts

IMPORTANT: When users ask you to create banners, modify designs, or add elements, you MUST use the appropriate tools to actually perform these actions. Don't just provide advice - use the tools to create the actual designs.

Always be helpful, professional, and provide actionable advice. If you need to use tools to get information or perform actions, do so to provide the most accurate and helpful response.

Context about the user:"""
        
        if context:
            system_message += f"\n{json.dumps(context, indent=2)}"
        
        return system_message
    
    async def _process_ai_response(self, response, context: Dict[str, Any]) -> str:
        """Process AI response and handle function calls"""
        try:
            message = response.choices[0].message
            logger.info(f"AI Response message: {message}")
            
            # Check if the AI wants to call a function
            if message.tool_calls:
                logger.info(f"AI wants to call {len(message.tool_calls)} tools: {[tc.function.name for tc in message.tool_calls]}")
                # Execute function calls
                tool_results = []
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)
                    logger.info(f"Executing tool: {function_name} with args: {function_args}")
                    
                    # Execute the function
                    result = await self._execute_tool_function(function_name, function_args, context)
                    logger.info(f"Tool {function_name} result: {result}")
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
                logger.info("AI did not call any tools, returning direct response")
                return message.content
                
        except Exception as e:
            logger.error(f"Error processing AI response: {e}")
            return f"I apologize, but I encountered an error while processing your request: {str(e)}"
    
    async def _execute_tool_function(self, function_name: str, function_args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute tool functions"""
        try:
            if function_name == "get_user_designs":
                return await self._get_user_designs(function_args.get("user_id"))
            elif function_name == "create_banner_design":
                return await self._create_banner_design(
                    function_args.get("user_id"),
                    function_args.get("design_spec")
                )
            elif function_name == "modify_banner_design":
                return await self._modify_banner_design(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("modifications")
                )
            elif function_name == "add_element_to_design":
                return await self._add_element_to_design(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element")
                )
            elif function_name == "generate_banner_from_prompt":
                return await self._generate_banner_from_prompt(
                    function_args.get("user_id"),
                    function_args.get("prompt"),
                    function_args.get("style"),
                    function_args.get("dimensions")
                )
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
    
    async def _create_banner_design(self, user_id: str, design_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new banner design programmatically"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            # Convert design spec to canvas data format
            canvas_data = self._convert_design_spec_to_canvas_data(design_spec)
            
            # Create the design in the database
            design_data = {
                "name": design_spec.get("title", "AI Generated Banner"),
                "canvas_data": canvas_data,
                "product_type": "banner",
                "quantity": 1,
                "dimensions": design_spec.get("dimensions", {"width": 800, "height": 400})
            }
            
            result = await db_manager.save_canvas_design(user_id, design_data)
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": f"Created banner design: {design_spec.get('title', 'AI Generated Banner')}",
                    "design_id": result.get("design_id"),
                    "canvas_data": canvas_data
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to create design")
                }
                
        except Exception as e:
            logger.error(f"Error creating banner design: {e}")
            return {
                "success": False,
                "error": f"Failed to create design: {str(e)}"
            }
    
    async def _modify_banner_design(self, user_id: str, design_id: str, modifications: Dict[str, Any]) -> Dict[str, Any]:
        """Modify an existing banner design"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            # Get existing design
            design = await db_manager.get_design(design_id)
            if not design or design.get("user_id") != user_id:
                return {
                    "success": False,
                    "error": "Design not found or not accessible"
                }
            
            # Apply modifications to canvas data
            canvas_data = design.get("canvas_data", {})
            modified_canvas = self._apply_modifications_to_canvas(canvas_data, modifications)
            
            # Update the design
            update_data = {
                "canvas_data": modified_canvas,
                "name": modifications.get("name", design.get("name"))
            }
            
            # Save updated design
            result = await db_manager.save_canvas_design(user_id, {
                "name": update_data["name"],
                "canvas_data": update_data["canvas_data"],
                "product_type": "banner",
                "quantity": 1,
                "dimensions": design.get("dimensions", {"width": 800, "height": 400})
            })
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": f"Modified banner design: {design.get('name')}",
                    "design_id": result.get("design_id"),
                    "canvas_data": modified_canvas
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to modify design")
                }
                
        except Exception as e:
            logger.error(f"Error modifying banner design: {e}")
            return {
                "success": False,
                "error": f"Failed to modify design: {str(e)}"
            }
    
    async def _add_element_to_design(self, user_id: str, design_id: str, element: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new element to a banner design"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            # Get existing design
            design = await db_manager.get_design(design_id)
            if not design or design.get("user_id") != user_id:
                return {
                    "success": False,
                    "error": "Design not found or not accessible"
                }
            
            # Add element to canvas data
            canvas_data = design.get("canvas_data", {})
            updated_canvas = self._add_element_to_canvas(canvas_data, element)
            
            # Save updated design
            result = await db_manager.save_canvas_design(user_id, {
                "name": design.get("name"),
                "canvas_data": updated_canvas,
                "product_type": "banner",
                "quantity": 1,
                "dimensions": design.get("dimensions", {"width": 800, "height": 400})
            })
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": f"Added {element.get('type', 'element')} to design: {design.get('name')}",
                    "design_id": result.get("design_id"),
                    "canvas_data": updated_canvas
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to add element")
                }
                
        except Exception as e:
            logger.error(f"Error adding element to design: {e}")
            return {
                "success": False,
                "error": f"Failed to add element: {str(e)}"
            }
    
    async def _generate_banner_from_prompt(self, user_id: str, prompt: str, style: str = None, dimensions: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a complete banner design from a text prompt"""
        try:
            # Use AI to interpret the prompt and create design specification
            design_spec = await self._interpret_prompt_to_design_spec(prompt, style, dimensions)
            
            # Create the design using the specification
            return await self._create_banner_design(user_id, design_spec)
            
        except Exception as e:
            logger.error(f"Error generating banner from prompt: {e}")
            return {
                "success": False,
                "error": f"Failed to generate banner: {str(e)}"
            }
    
    def _convert_design_spec_to_canvas_data(self, design_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Convert design specification to canvas data format"""
        canvas_data = {
            "version": "2.0",
            "objects": [],
            "background": design_spec.get("background_color", "#ffffff"),
            "width": design_spec.get("dimensions", {}).get("width", 800),
            "height": design_spec.get("dimensions", {}).get("height", 400)
        }
        
        # Convert elements to canvas objects
        elements = design_spec.get("elements", [])
        for i, element in enumerate(elements):
            canvas_object = self._convert_element_to_canvas_object(element, i)
            if canvas_object:
                canvas_data["objects"].append(canvas_object)
        
        return canvas_data
    
    def _convert_element_to_canvas_object(self, element: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Convert an element to canvas object format"""
        element_type = element.get("type", "text")
        
        if element_type == "text":
            return {
                "id": f"text_{index}",
                "type": "text",
                "text": element.get("content", ""),
                "x": element.get("position", {}).get("x", 50),
                "y": element.get("position", {}).get("y", 50),
                "width": element.get("size", {}).get("width", 200),
                "height": element.get("size", {}).get("height", 50),
                "fill": element.get("color", "#000000"),
                "fontSize": element.get("font_size", 24),
                "fontFamily": element.get("font_family", "Arial"),
                "fontWeight": "bold"
            }
        elif element_type == "shape":
            return {
                "id": f"shape_{index}",
                "type": "rect",
                "x": element.get("position", {}).get("x", 50),
                "y": element.get("position", {}).get("y", 50),
                "width": element.get("size", {}).get("width", 100),
                "height": element.get("size", {}).get("height", 100),
                "fill": element.get("color", "#ff0000"),
                "stroke": "#000000",
                "strokeWidth": 2
            }
        elif element_type == "icon":
            return {
                "id": f"icon_{index}",
                "type": "image",
                "x": element.get("position", {}).get("x", 50),
                "y": element.get("position", {}).get("y", 50),
                "width": element.get("size", {}).get("width", 50),
                "height": element.get("size", {}).get("height", 50),
                "src": element.get("content", ""),  # Icon URL or path
                "opacity": 1
            }
        
        return None
    
    def _apply_modifications_to_canvas(self, canvas_data: Dict[str, Any], modifications: Dict[str, Any]) -> Dict[str, Any]:
        """Apply modifications to canvas data"""
        modified_canvas = canvas_data.copy()
        
        # Apply background color change
        if "background_color" in modifications:
            modified_canvas["background"] = modifications["background_color"]
        
        # Apply element modifications
        if "elements" in modifications:
            modified_canvas["objects"] = []
            for element in modifications["elements"]:
                canvas_object = self._convert_element_to_canvas_object(element, len(modified_canvas["objects"]))
                if canvas_object:
                    modified_canvas["objects"].append(canvas_object)
        
        return modified_canvas
    
    def _add_element_to_canvas(self, canvas_data: Dict[str, Any], element: Dict[str, Any]) -> Dict[str, Any]:
        """Add an element to existing canvas data"""
        updated_canvas = canvas_data.copy()
        
        # Convert element to canvas object
        canvas_object = self._convert_element_to_canvas_object(element, len(updated_canvas.get("objects", [])))
        if canvas_object:
            if "objects" not in updated_canvas:
                updated_canvas["objects"] = []
            updated_canvas["objects"].append(canvas_object)
        
        return updated_canvas
    
    async def _interpret_prompt_to_design_spec(self, prompt: str, style: str = None, dimensions: Dict[str, Any] = None) -> Dict[str, Any]:
        """Use AI to interpret a text prompt and create a design specification"""
        try:
            # Create a focused prompt for design interpretation
            interpretation_prompt = f"""
            Create a banner design specification based on this request: "{prompt}"
            
            Style: {style or 'modern'}
            Dimensions: {dimensions or {'width': 800, 'height': 400}}
            
            Return a JSON specification with:
            - title: Banner name
            - background_color: Hex color code
            - elements: Array of design elements (text, shapes, icons)
            - dimensions: Width and height
            
            Focus on creating a professional, visually appealing banner that matches the request.
            """
            
            # Use OpenAI to interpret the prompt
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a professional banner designer. Create detailed design specifications in JSON format."},
                    {"role": "user", "content": interpretation_prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            # Parse the AI response
            ai_response = response.choices[0].message.content
            
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
            if json_match:
                design_spec = json.loads(json_match.group())
                return design_spec
            else:
                # Fallback: create a basic design spec
                return self._create_fallback_design_spec(prompt, style, dimensions)
                
        except Exception as e:
            logger.error(f"Error interpreting prompt: {e}")
            return self._create_fallback_design_spec(prompt, style, dimensions)
    
    def _create_fallback_design_spec(self, prompt: str, style: str = None, dimensions: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a fallback design specification when AI interpretation fails"""
        return {
            "title": f"AI Generated: {prompt[:50]}...",
            "background_color": "#ffffff",
            "dimensions": dimensions or {"width": 800, "height": 400},
            "elements": [
                {
                    "type": "text",
                    "content": prompt[:100],
                    "position": {"x": 50, "y": 200},
                    "size": {"width": 700, "height": 50},
                    "color": "#000000",
                    "font_size": 32,
                    "font_family": "Arial"
                }
            ]
        }
    
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
