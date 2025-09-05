#!/usr/bin/env python3
"""
🌟 AOS Framework AI Agent Adapter - SERVER_TEMPLATES_GUIDE.md Compliant
MANDATORY pattern for AI agent integration with full MCP compliance.
"""

import os
import json
import logging
import time
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
        # Initialize with comprehensive sidebar tools
        self.available_tools = self._initialize_sidebar_tools()
    
    def _initialize_sidebar_tools(self):
        """Initialize comprehensive sidebar tools that mirror all user capabilities"""
        return [
            # === CANVAS MANAGEMENT TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "create_new_design",
                    "description": "Create a new banner design from scratch",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "name": {"type": "string", "description": "Design name"},
                            "width": {"type": "number", "description": "Canvas width in pixels"},
                            "height": {"type": "number", "description": "Canvas height in pixels"},
                            "background_color": {"type": "string", "description": "Background color (hex)"}
                        },
                        "required": ["user_id", "name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "change_canvas_size",
                    "description": "Change the canvas dimensions",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "width": {"type": "number", "description": "New width"},
                            "height": {"type": "number", "description": "New height"}
                        },
                        "required": ["user_id", "design_id", "width", "height"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "change_background_color",
                    "description": "Change the canvas background color",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "color": {"type": "string", "description": "Background color (hex)"}
                        },
                        "required": ["user_id", "design_id", "color"]
                    }
                }
            },
            
            # === TEXT TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "add_text",
                    "description": "Add text element to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "text": {"type": "string", "description": "Text content"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "font_size": {"type": "number", "description": "Font size"},
                            "font_family": {"type": "string", "description": "Font family"},
                            "color": {"type": "string", "description": "Text color (hex)"},
                            "align": {"type": "string", "enum": ["left", "center", "right"], "description": "Text alignment"}
                        },
                        "required": ["user_id", "design_id", "text"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "modify_text",
                    "description": "Modify existing text element properties",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Text element ID"},
                            "text": {"type": "string", "description": "New text content"},
                            "font_size": {"type": "number", "description": "New font size"},
                            "font_family": {"type": "string", "description": "New font family"},
                            "color": {"type": "string", "description": "New text color (hex)"},
                            "align": {"type": "string", "enum": ["left", "center", "right"], "description": "New text alignment"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            
            # === SHAPE TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "add_rectangle",
                    "description": "Add rectangle shape to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "width": {"type": "number", "description": "Width"},
                            "height": {"type": "number", "description": "Height"},
                            "fill_color": {"type": "string", "description": "Fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "Stroke color (hex)"},
                            "stroke_width": {"type": "number", "description": "Stroke width"}
                        },
                        "required": ["user_id", "design_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_circle",
                    "description": "Add circle shape to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "radius": {"type": "number", "description": "Circle radius"},
                            "fill_color": {"type": "string", "description": "Fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "Stroke color (hex)"},
                            "stroke_width": {"type": "number", "description": "Stroke width"}
                        },
                        "required": ["user_id", "design_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_star",
                    "description": "Add star shape to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "num_points": {"type": "number", "description": "Number of star points"},
                            "inner_radius": {"type": "number", "description": "Inner radius"},
                            "outer_radius": {"type": "number", "description": "Outer radius"},
                            "fill_color": {"type": "string", "description": "Fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "Stroke color (hex)"},
                            "stroke_width": {"type": "number", "description": "Stroke width"}
                        },
                        "required": ["user_id", "design_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_triangle",
                    "description": "Add triangle shape to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "radius": {"type": "number", "description": "Triangle radius"},
                            "fill_color": {"type": "string", "description": "Fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "Stroke color (hex)"},
                            "stroke_width": {"type": "number", "description": "Stroke width"}
                        },
                        "required": ["user_id", "design_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_hexagon",
                    "description": "Add hexagon shape to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "radius": {"type": "number", "description": "Hexagon radius"},
                            "fill_color": {"type": "string", "description": "Fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "Stroke color (hex)"},
                            "stroke_width": {"type": "number", "description": "Stroke width"}
                        },
                        "required": ["user_id", "design_id"]
                    }
                }
            },
            
            # === ICON TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "add_icon",
                    "description": "Add an icon from the icon library to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "icon_name": {"type": "string", "description": "Name of the icon to add"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "width": {"type": "number", "description": "Icon width"},
                            "height": {"type": "number", "description": "Icon height"}
                        },
                        "required": ["user_id", "design_id", "icon_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_available_icons",
                    "description": "Get list of available icons by category",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string", "description": "Icon category (medical, business, technology, etc.)"}
                        }
                    }
                }
            },
            
            # === QR CODE TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "add_qr_code",
                    "description": "Add QR code element to the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "url": {"type": "string", "description": "URL or text to encode"},
                            "x": {"type": "number", "description": "X position"},
                            "y": {"type": "number", "description": "Y position"},
                            "width": {"type": "number", "description": "QR code width"},
                            "height": {"type": "number", "description": "QR code height"},
                            "qr_color": {"type": "string", "description": "QR code color (hex)"},
                            "background_color": {"type": "string", "description": "Background color (hex)"}
                        },
                        "required": ["user_id", "design_id", "url"]
                    }
                }
            },
            
            # === ELEMENT MANIPULATION TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "move_element",
                    "description": "Move an element to a new position",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID to move"},
                            "x": {"type": "number", "description": "New X position"},
                            "y": {"type": "number", "description": "New Y position"}
                        },
                        "required": ["user_id", "design_id", "element_id", "x", "y"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "resize_element",
                    "description": "Resize an element",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID to resize"},
                            "width": {"type": "number", "description": "New width"},
                            "height": {"type": "number", "description": "New height"}
                        },
                        "required": ["user_id", "design_id", "element_id", "width", "height"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "change_element_color",
                    "description": "Change the color of an element",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID"},
                            "fill_color": {"type": "string", "description": "New fill color (hex)"},
                            "stroke_color": {"type": "string", "description": "New stroke color (hex)"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_element",
                    "description": "Delete an element from the design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID to delete"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "duplicate_element",
                    "description": "Duplicate an element",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID to duplicate"},
                            "x_offset": {"type": "number", "description": "X offset for duplicate"},
                            "y_offset": {"type": "number", "description": "Y offset for duplicate"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            
            # === LAYER MANAGEMENT TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "bring_to_front",
                    "description": "Bring element to front layer",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "send_to_back",
                    "description": "Send element to back layer",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "element_id": {"type": "string", "description": "Element ID"}
                        },
                        "required": ["user_id", "design_id", "element_id"]
                    }
                }
            },
            
            # === DESIGN MANAGEMENT TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "get_user_designs",
                    "description": "Get user's saved designs and templates",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"}
                        },
                        "required": ["user_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "save_design",
                    "description": "Save the current design",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "design_id": {"type": "string", "description": "Design ID"},
                            "name": {"type": "string", "description": "Design name"}
                        },
                        "required": ["user_id", "design_id"]
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
                            "user_id": {"type": "string", "description": "User ID"},
                            "prompt": {"type": "string", "description": "Text description of the banner to create"},
                            "style": {"type": "string", "description": "Design style (modern, vintage, corporate, creative)"},
                            "width": {"type": "number", "description": "Banner width"},
                            "height": {"type": "number", "description": "Banner height"}
                        },
                        "required": ["user_id", "prompt"]
                    }
                }
            },
            
            # === ORDER AND PRODUCT TOOLS ===
            {
                "type": "function",
                "function": {
                    "name": "get_user_orders",
                    "description": "Get user's order history and status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "user_id": {"type": "string", "description": "User ID"},
                            "order_id": {"type": "string", "description": "Specific order ID (optional)"}
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
                        "properties": {
                            "product_type": {"type": "string", "description": "Type of product (banner, sign, sticker, etc.)"}
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_banner_pricing",
                    "description": "Calculate pricing for banner orders",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_type": {"type": "string", "description": "Type of product"},
                            "quantity": {"type": "number", "description": "Quantity to order"},
                            "dimensions": {"type": "object", "description": "Product dimensions"}
                        },
                        "required": ["product_type", "quantity", "dimensions"]
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
                            "use_case": {"type": "string", "description": "Intended use case for the banner"},
                            "industry": {"type": "string", "description": "Industry or business type"},
                            "dimensions": {"type": "object", "description": "Banner dimensions"}
                        },
                        "required": ["use_case"]
                    }
                }
            }
        ]
    
    async def initialize(self) -> bool:
        """Initialize AI agent adapter with health check"""
        # If already initialized, return success
        if self._initialized and self.openai_client:
            logger.info("AI Agent already initialized, skipping initialization")
            return True
            
        try:
            # Check if OpenAI API key is configured
            api_key = os.getenv("OPENAI_API_KEY")
            logger.info(f"Environment check - OPENAI_API_KEY exists: {bool(api_key)}")
            logger.info(f"Environment check - API key length: {len(api_key) if api_key else 0}")
            logger.info(f"Environment check - API key prefix: {api_key[:10] if api_key else 'None'}...")
            
            # Debug: Show all OpenAI-related environment variables
            openai_vars = {k: v for k, v in os.environ.items() if 'OPENAI' in k.upper()}
            logger.info(f"All OpenAI environment variables: {list(openai_vars.keys())}")
            
            if not api_key:
                self.initialization_error = "OpenAI API key not configured"
                logger.error("OpenAI API key not found in environment variables")
                return False
            
            # Initialize OpenAI client
            self.openai_client = AsyncOpenAI(
                api_key=api_key,
                http_client=httpx.AsyncClient()
            )
            
            # Test OpenAI API
            test_response = await self.openai_client.chat.completions.create(
                model="gpt-5-mini-2025-08-07",
                messages=[{"role": "user", "content": "Hello"}],
                max_completion_tokens=100
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
            logger.info(f"User query: '{query}'")
            response = await self.openai_client.chat.completions.create(
                model="gpt-5-mini-2025-08-07",
                messages=messages,
                tools=self.available_tools,
                tool_choice="auto",
                max_completion_tokens=1500
            )
            
            logger.info(f"OpenAI response: {response.choices[0].message}")
            
            # Process the response
            result = await self._process_ai_response(response, context)
            
            # Handle structured response (with design data) or simple text response
            if isinstance(result, dict) and "response" in result:
                # Structured response with design data
                return {
                    "success": True,
                    "response": result["response"],
                    "design_created": result.get("design_created", False),
                    "design_modified": result.get("design_modified", False),
                    "design_data": result.get("design_data"),
                    "mcp_compliant": True,
                    "server_templates_guide_compliant": True
                }
            else:
                # Simple text response
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
        system_message = """You are an AI assistant for BuyPrintz, a professional banner printing platform. You have FULL PROGRAMMATIC CONTROL of the banner editor and can use ALL sidebar tools that users have access to.

You help users with:
1. Banner design assistance and recommendations
2. Order management and tracking
3. Product selection and pricing
4. General questions about banners and printing
5. Creating new banner designs from text descriptions
6. Modifying existing banner designs
7. Adding elements to banners
8. Generating QR codes for URLs or text

You have access to COMPREHENSIVE SIDEBAR TOOLS that let you:

=== CANVAS MANAGEMENT ===
- create_new_design: Create new banner designs from scratch
- change_canvas_size: Change canvas dimensions
- change_background_color: Change canvas background color

=== TEXT TOOLS ===
- add_text: Add text elements with full formatting control
- modify_text: Modify existing text properties (content, font, color, alignment)

=== SHAPE TOOLS ===
- add_rectangle: Add rectangle shapes
- add_circle: Add circle shapes
- add_star: Add star shapes with customizable points and radii
- add_triangle: Add triangle shapes
- add_hexagon: Add hexagon shapes

=== ICON TOOLS ===
- add_icon: Add icons from the comprehensive icon library
- list_available_icons: Get available icons by category

=== QR CODE TOOLS ===
- add_qr_code: Generate and add QR codes with custom colors

=== ELEMENT MANIPULATION ===
- move_element: Move elements to new positions
- resize_element: Resize elements
- change_element_color: Change element colors
- delete_element: Delete elements
- duplicate_element: Duplicate elements

=== LAYER MANAGEMENT ===
- bring_to_front: Bring elements to front layer
- send_to_back: Send elements to back layer

=== DESIGN MANAGEMENT ===
- get_user_designs: Get user's saved designs
- save_design: Save current designs
- generate_banner_from_prompt: Generate complete banners from text prompts

=== ORDER & PRODUCT TOOLS ===
- get_user_orders: Get order history and status
- get_banner_products: Get available products
- calculate_banner_pricing: Calculate pricing
- get_design_recommendations: Get AI-powered recommendations

CRITICAL INSTRUCTIONS:
- You have FULL CONTROL of the banner editor - use the tools to perform actual actions
- When users ask to "create a banner", "generate a banner", or "make a banner", you MUST call generate_banner_from_prompt
- When users ask to "add text", "add shapes", "add icons", use the specific add_* tools
            - When users ask to "add QR code", "generate QR code", "create QR code", you MUST call add_qr_code (NOT create_new_design)
            - The add_qr_code tool will automatically create a new canvas if no design_id is provided
            - For immediate canvas updates, use direct manipulation tools (add_text, add_qr_code, add_rectangle, etc.) which return canvas_data
            - These tools work with or without existing design_id - they create new canvas data if needed
            - The frontend will handle displaying the updated canvas immediately
            - IMPORTANT: For QR codes, always use add_qr_code, never create_new_design
- When users ask to "move", "resize", "delete", "duplicate" elements, use the element manipulation tools
- When users ask to "change colors", "modify text", use the modification tools
- NEVER just provide advice - ALWAYS use the tools to perform the actual actions
- NEVER describe what you would do - ALWAYS call the appropriate tool function
- DO NOT give generic responses like "I understand your request" - CALL THE TOOLS IMMEDIATELY
- After using tools, ALWAYS provide a detailed response explaining what you accomplished
- Be specific about what was created, modified, or added
- Include relevant details like design IDs, dimensions, colors, or other specifications

You are a POWERFUL AI that can manipulate the banner editor just like a human user. Use your tools to create amazing designs!

IMPORTANT: You MUST call the appropriate tool function for every request. Do not just describe what you would do - actually call the tools. The tools are available and ready to use.

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
                    {"role": "user", "content": "Please provide a detailed, helpful response about what you just accomplished with the tools. Be specific about what was created or modified. Include details about the design elements, colors, dimensions, and any other specifications."},
                    {"role": "assistant", "content": message.content or "", "tool_calls": [
                        {
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        } for tc in message.tool_calls
                    ]}
                ]
                
                # Add tool results to messages
                for tool_result in tool_results:
                    final_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_result["tool_call_id"],
                        "content": json.dumps(tool_result["result"])
                    })
                
                # Get final response
                logger.info(f"Sending final messages to OpenAI: {len(final_messages)} messages")
                for i, msg in enumerate(final_messages):
                    logger.info(f"Message {i}: {msg['role']} - {msg['content'][:100]}...")
                
                final_response = await self.openai_client.chat.completions.create(
                    model="gpt-5-mini-2025-08-07",
                    messages=final_messages,
                    max_completion_tokens=1000
                )
                
                final_content = final_response.choices[0].message.content
                logger.info(f"Final AI response content: '{final_content}'")
                logger.info(f"Final response object: {final_response.choices[0].message}")
                
                # If final content is empty, provide a fallback response
                if not final_content or final_content.strip() == "":
                    # Create a more specific fallback based on what tools were executed
                    if tool_results:
                        tool_names = [tr["function_name"] for tr in tool_results]
                        if "add_qr_code" in tool_names:
                            final_content = "I've successfully added a QR code to your canvas! The QR code has been generated and is now visible on your design."
                        elif "add_text" in tool_names:
                            final_content = "I've successfully added text to your canvas! The text element has been created and is now visible on your design."
                        elif "generate_banner_from_prompt" in tool_names:
                            final_content = "I've successfully generated your banner design! The complete banner has been created and is now ready for you to view and customize."
                        else:
                            final_content = "I've successfully completed your request! The design has been updated and is now ready for you to view and customize."
                    else:
                        final_content = "I've successfully completed your request! The design has been updated and is now ready for you to view and customize."
                    logger.info(f"Using fallback response: '{final_content}'")
                
                # Check if any tool created or modified a design
                design_created = False
                design_modified = False
                design_data = None
                
                for tool_result in tool_results:
                    # Design creation tools
                    if tool_result["function_name"] in ["generate_banner_from_prompt", "create_banner_design", "create_new_design"]:
                        if tool_result["result"].get("success"):
                            design_created = True
                            design_data = tool_result["result"].get("canvas_data")
                            break
                    # Design modification tools
                    elif tool_result["function_name"] in [
                        "modify_banner_design", "add_element_to_design", "generate_qr_code", "add_qr_code",
                        "add_text", "modify_text", "add_rectangle", "add_circle", "add_star", "add_triangle", "add_hexagon",
                        "add_icon", "move_element", "resize_element", "change_element_color", "delete_element",
                        "duplicate_element", "bring_to_front", "send_to_back", "change_canvas_size", "change_background_color"
                    ]:
                        if tool_result["result"].get("success"):
                            design_modified = True
                            # Try to get design_data first, then fallback to canvas_data
                            design_data = tool_result["result"].get("design_data") or tool_result["result"].get("canvas_data")
                            break
                
                # Return structured response with design data if applicable
                if design_created or design_modified:
                    # Ensure design_data has the correct structure for frontend
                    if design_data and not isinstance(design_data, dict):
                        design_data = {"canvas_data": design_data}
                    elif design_data and "canvas_data" not in design_data:
                        design_data = {"canvas_data": design_data}
                    
                    return {
                        "response": final_content,
                        "design_created": design_created,
                        "design_modified": design_modified,
                        "design_data": design_data
                    }
                else:
                    return final_content
            else:
                logger.info("AI did not call any tools, returning direct response")
                return message.content
                
        except Exception as e:
            logger.error(f"Error processing AI response: {e}")
            return f"I apologize, but I encountered an error while processing your request: {str(e)}"
    
    async def _execute_tool_function(self, function_name: str, function_args: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute comprehensive sidebar tool functions"""
        try:
            # === CANVAS MANAGEMENT TOOLS ===
            if function_name == "create_new_design":
                return await self._create_new_design(
                    function_args.get("user_id"),
                    function_args.get("name"),
                    function_args.get("width"),
                    function_args.get("height"),
                    function_args.get("background_color")
                )
            elif function_name == "change_canvas_size":
                return await self._change_canvas_size(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("width"),
                    function_args.get("height")
                )
            elif function_name == "change_background_color":
                return await self._change_background_color(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("color")
                )
            
            # === TEXT TOOLS ===
            elif function_name == "add_text":
                return await self._add_text(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("text"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("font_size"),
                    function_args.get("font_family"),
                    function_args.get("color"),
                    function_args.get("align")
                )
            elif function_name == "modify_text":
                return await self._modify_text(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id"),
                    function_args.get("text"),
                    function_args.get("font_size"),
                    function_args.get("font_family"),
                    function_args.get("color"),
                    function_args.get("align")
                )
            
            # === SHAPE TOOLS ===
            elif function_name == "add_rectangle":
                return await self._add_rectangle(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("width"),
                    function_args.get("height"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color"),
                    function_args.get("stroke_width")
                )
            elif function_name == "add_circle":
                return await self._add_circle(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("radius"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color"),
                    function_args.get("stroke_width")
                )
            elif function_name == "add_star":
                return await self._add_star(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("num_points"),
                    function_args.get("inner_radius"),
                    function_args.get("outer_radius"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color"),
                    function_args.get("stroke_width")
                )
            elif function_name == "add_triangle":
                return await self._add_triangle(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("radius"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color"),
                    function_args.get("stroke_width")
                )
            elif function_name == "add_hexagon":
                return await self._add_hexagon(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("radius"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color"),
                    function_args.get("stroke_width")
                )
            
            # === ICON TOOLS ===
            elif function_name == "add_icon":
                return await self._add_icon(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("icon_name"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("width"),
                    function_args.get("height")
                )
            elif function_name == "list_available_icons":
                return await self._list_available_icons(function_args.get("category"))
            
            # === QR CODE TOOLS ===
            elif function_name == "add_qr_code":
                return await self._add_qr_code(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("url"),
                    function_args.get("x"),
                    function_args.get("y"),
                    function_args.get("width"),
                    function_args.get("height"),
                    function_args.get("qr_color"),
                    function_args.get("background_color")
                )
            
            # === ELEMENT MANIPULATION TOOLS ===
            elif function_name == "move_element":
                return await self._move_element(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id"),
                    function_args.get("x"),
                    function_args.get("y")
                )
            elif function_name == "resize_element":
                return await self._resize_element(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id"),
                    function_args.get("width"),
                    function_args.get("height")
                )
            elif function_name == "change_element_color":
                return await self._change_element_color(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id"),
                    function_args.get("fill_color"),
                    function_args.get("stroke_color")
                )
            elif function_name == "delete_element":
                return await self._delete_element(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id")
                )
            elif function_name == "duplicate_element":
                return await self._duplicate_element(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id"),
                    function_args.get("x_offset"),
                    function_args.get("y_offset")
                )
            
            # === LAYER MANAGEMENT TOOLS ===
            elif function_name == "bring_to_front":
                return await self._bring_to_front(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id")
                )
            elif function_name == "send_to_back":
                return await self._send_to_back(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("element_id")
                )
            
            # === DESIGN MANAGEMENT TOOLS ===
            elif function_name == "get_user_designs":
                return await self._get_user_designs(function_args.get("user_id"))
            elif function_name == "save_design":
                return await self._save_design(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("name")
                )
            elif function_name == "generate_banner_from_prompt":
                return await self._generate_banner_from_prompt(
                    function_args.get("user_id"),
                    function_args.get("prompt"),
                    function_args.get("style"),
                    function_args.get("width"),
                    function_args.get("height")
                )
            
            # === ORDER AND PRODUCT TOOLS ===
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
            
            # Legacy support for old tool names
            elif function_name == "generate_qr_code":
                return await self._add_qr_code(
                    function_args.get("user_id"),
                    function_args.get("design_id"),
                    function_args.get("url"),
                    function_args.get("position", {}).get("x") if function_args.get("position") else None,
                    function_args.get("position", {}).get("y") if function_args.get("position") else None,
                    function_args.get("size", {}).get("width") if function_args.get("size") else None,
                    function_args.get("size", {}).get("height") if function_args.get("size") else None
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
    
    async def _generate_qr_code(self, user_id: str, design_id: str, url: str, position: Dict[str, Any] = None, size: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate a QR code element for a banner design"""
        try:
            # Import here to avoid circular imports
            from database import db_manager
            
            # Get existing design
            design = await db_manager.get_design(design_id)
            if not design or design.get("user_id") != user_id:
                return {
                    "success": False,
                    "error": "Design not found or access denied"
                }
            
            # Get current canvas data
            canvas_data = design.get("canvas_data", {})
            if not canvas_data:
                return {
                    "success": False,
                    "error": "No canvas data found for design"
                }
            
            # Default position and size
            default_position = {"x": 50, "y": 50}
            default_size = {"width": 100, "height": 100}
            
            position = position or default_position
            size = size or default_size
            
            # Create QR code element
            qr_element = {
                "id": f"qr_{len(canvas_data.get('objects', []))}",
                "type": "qr_code",
                "url": url,
                "x": position.get("x", 50),
                "y": position.get("y", 50),
                "width": size.get("width", 100),
                "height": size.get("height", 100),
                "fill": "#000000",
                "stroke": "#000000",
                "strokeWidth": 1,
                "rotation": 0
            }
            
            # Add QR code to canvas data
            if "objects" not in canvas_data:
                canvas_data["objects"] = []
            
            canvas_data["objects"].append(qr_element)
            
            # Update design in database
            update_data = {
                "canvas_data": canvas_data
            }
            
            result = await db_manager.update_design(design_id, update_data)
            
            if result.get("success"):
                return {
                    "success": True,
                    "message": f"QR code for '{url}' added to design",
                    "design_id": design_id,
                    "canvas_data": canvas_data,
                    "qr_element": qr_element
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to update design")
                }
                
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return {
                "success": False,
                "error": f"Failed to generate QR code: {str(e)}"
            }
    
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
                model="gpt-5-mini-2025-08-07",
                messages=[
                    {"role": "system", "content": "You are a professional banner designer. Create detailed design specifications in JSON format."},
                    {"role": "user", "content": interpretation_prompt}
                ],
                max_completion_tokens=1000
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

# Create global instance with proper initialization
ai_agent_adapter = AIAgentAdapter()

# Add comprehensive sidebar tool methods to the AIAgentAdapter class
async def _create_new_design(self, user_id: str, name: str, width: int = 800, height: int = 400, background_color: str = "#ffffff") -> Dict[str, Any]:
    """Create a new banner design from scratch"""
    try:
        from database import db_manager
        canvas_data = {
            "version": "2.0",
            "width": width,
            "height": height,
            "background": background_color,
            "objects": []
        }
        # For direct canvas manipulation, we can return the canvas data immediately
        # The user can save it later if they want to persist it
        return {
            "success": True,
            "message": f"Created new design: {name}",
            "design_id": f"temp_{int(time.time())}",  # Temporary ID for immediate use
            "canvas_data": canvas_data,
            "design_data": {
                "design_id": f"temp_{int(time.time())}",
                "canvas_data": canvas_data
            },
            "direct_manipulation": True
        }
    except Exception as e:
        logger.error(f"Error creating new design: {e}")
        return {"success": False, "error": str(e)}

async def _change_canvas_size(self, user_id: str, design_id: str, width: int, height: int) -> Dict[str, Any]:
    """Change the canvas dimensions"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        canvas_data["width"] = width
        canvas_data["height"] = height
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Changed canvas size to {width}x{height}",
                "canvas_data": canvas_data
            }
        else:
            return {"success": False, "error": "Failed to update canvas size"}
    except Exception as e:
        logger.error(f"Error changing canvas size: {e}")
        return {"success": False, "error": str(e)}

async def _change_background_color(self, user_id: str, design_id: str, color: str) -> Dict[str, Any]:
    """Change the canvas background color"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        canvas_data["background"] = color
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Changed background color to {color}",
                "canvas_data": canvas_data
            }
        else:
            return {"success": False, "error": "Failed to update background color"}
    except Exception as e:
        logger.error(f"Error changing background color: {e}")
        return {"success": False, "error": str(e)}

async def _add_text(self, user_id: str, design_id: str, text: str, x: int = None, y: int = None, font_size: int = 24, font_family: str = "Arial", color: str = "#000000", align: str = "left") -> Dict[str, Any]:
    """Add text element to the design"""
    try:
        # If design_id is provided, try to get existing design
        canvas_data = None
        if design_id:
            from database import db_manager
            design = await db_manager.get_design(design_id)
            if design:
                canvas_data = design.get("canvas_data", {})
        
        # If no existing design or design_id not provided, create new canvas data
        if not canvas_data:
            canvas_data = {
                "version": "2.0",
                "width": 800,
                "height": 400,
                "background": "#ffffff",
                "objects": []
            }
        
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - 100
        if y is None:
            y = canvas_data.get("height", 400) // 2 - 15
        
        text_element = {
            "id": f"text_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "text",
            "x": x,
            "y": y,
            "text": text,
            "fontSize": font_size,
            "fontFamily": font_family,
            "fill": color,
            "align": align,
            "verticalAlign": "top",
            "fontStyle": "normal",
            "textDecoration": "none",
            "lineHeight": 1.2,
            "letterSpacing": 0,
            "padding": 0,
            "width": 200,
            "height": 30,
            "rotation": 0
        }
        
        canvas_data["objects"].append(text_element)
        
        # For direct canvas manipulation, we don't need to save to database immediately
        return {
            "success": True,
            "message": f"Added text: {text}",
            "canvas_data": canvas_data,
            "design_data": {
                "design_id": design_id or f"temp_{int(time.time())}",
                "canvas_data": canvas_data
            },
            "element": text_element,
            "direct_manipulation": True
        }
    except Exception as e:
        logger.error(f"Error adding text: {e}")
        return {"success": False, "error": str(e)}

async def _modify_text(self, user_id: str, design_id: str, element_id: str, text: str = None, font_size: int = None, font_family: str = None, color: str = None, align: str = None) -> Dict[str, Any]:
    """Modify existing text element properties"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id and obj.get("type") == "text":
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Text element not found"}
        
        # Update properties
        if text is not None:
            objects[element_index]["text"] = text
        if font_size is not None:
            objects[element_index]["fontSize"] = font_size
        if font_family is not None:
            objects[element_index]["fontFamily"] = font_family
        if color is not None:
            objects[element_index]["fill"] = color
        if align is not None:
            objects[element_index]["align"] = align
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Modified text element: {element_id}",
                "canvas_data": canvas_data,
                "element": objects[element_index]
            }
        else:
            return {"success": False, "error": "Failed to modify text"}
    except Exception as e:
        logger.error(f"Error modifying text: {e}")
        return {"success": False, "error": str(e)}

# Add placeholder methods for all comprehensive sidebar tools
async def _add_rectangle(self, user_id: str, design_id: str, x: int = None, y: int = None, width: int = 200, height: int = 100, fill_color: str = "#6B7280", stroke_color: str = "#374151", stroke_width: int = 2) -> Dict[str, Any]:
    """Add rectangle shape to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - width // 2
        if y is None:
            y = canvas_data.get("height", 400) // 2 - height // 2
        
        rectangle_element = {
            "id": f"rect_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "rect",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fill": fill_color,
            "stroke": stroke_color,
            "strokeWidth": stroke_width,
            "rotation": 0
        }
        
        canvas_data["objects"].append(rectangle_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added rectangle: {width}x{height}",
                "canvas_data": canvas_data,
                "element": rectangle_element
            }
        else:
            return {"success": False, "error": "Failed to add rectangle"}
    except Exception as e:
        logger.error(f"Error adding rectangle: {e}")
        return {"success": False, "error": str(e)}

async def _add_circle(self, user_id: str, design_id: str, x: int = None, y: int = None, radius: int = 60, fill_color: str = "#6B7280", stroke_color: str = "#374151", stroke_width: int = 2) -> Dict[str, Any]:
    """Add circle shape to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - radius
        if y is None:
            y = canvas_data.get("height", 400) // 2 - radius
        
        circle_element = {
            "id": f"circle_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "circle",
            "x": x,
            "y": y,
            "radius": radius,
            "fill": fill_color,
            "stroke": stroke_color,
            "strokeWidth": stroke_width,
            "rotation": 0
        }
        
        canvas_data["objects"].append(circle_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added circle: radius {radius}",
                "canvas_data": canvas_data,
                "element": circle_element
            }
        else:
            return {"success": False, "error": "Failed to add circle"}
    except Exception as e:
        logger.error(f"Error adding circle: {e}")
        return {"success": False, "error": str(e)}

async def _add_star(self, user_id: str, design_id: str, x: int = None, y: int = None, num_points: int = 5, inner_radius: int = 40, outer_radius: int = 80, fill_color: str = "#6B7280", stroke_color: str = "#374151", stroke_width: int = 2) -> Dict[str, Any]:
    """Add star shape to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - outer_radius
        if y is None:
            y = canvas_data.get("height", 400) // 2 - outer_radius
        
        star_element = {
            "id": f"star_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "star",
            "x": x,
            "y": y,
            "numPoints": num_points,
            "innerRadius": inner_radius,
            "outerRadius": outer_radius,
            "fill": fill_color,
            "stroke": stroke_color,
            "strokeWidth": stroke_width,
            "rotation": 0
        }
        
        canvas_data["objects"].append(star_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added star: {num_points} points, inner {inner_radius}, outer {outer_radius}",
                "canvas_data": canvas_data,
                "element": star_element
            }
        else:
            return {"success": False, "error": "Failed to add star"}
    except Exception as e:
        logger.error(f"Error adding star: {e}")
        return {"success": False, "error": str(e)}

async def _add_triangle(self, user_id: str, design_id: str, x: int = None, y: int = None, radius: int = 60, fill_color: str = "#6B7280", stroke_color: str = "#374151", stroke_width: int = 2) -> Dict[str, Any]:
    """Add triangle shape to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - radius
        if y is None:
            y = canvas_data.get("height", 400) // 2 - radius
        
        triangle_element = {
            "id": f"triangle_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "triangle",
            "x": x,
            "y": y,
            "sides": 3,
            "radius": radius,
            "fill": fill_color,
            "stroke": stroke_color,
            "strokeWidth": stroke_width,
            "rotation": 0
        }
        
        canvas_data["objects"].append(triangle_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added triangle: radius {radius}",
                "canvas_data": canvas_data,
                "element": triangle_element
            }
        else:
            return {"success": False, "error": "Failed to add triangle"}
    except Exception as e:
        logger.error(f"Error adding triangle: {e}")
        return {"success": False, "error": str(e)}

async def _add_hexagon(self, user_id: str, design_id: str, x: int = None, y: int = None, radius: int = 60, fill_color: str = "#6B7280", stroke_color: str = "#374151", stroke_width: int = 2) -> Dict[str, Any]:
    """Add hexagon shape to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - radius
        if y is None:
            y = canvas_data.get("height", 400) // 2 - radius
        
        hexagon_element = {
            "id": f"hexagon_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "hexagon",
            "x": x,
            "y": y,
            "sides": 6,
            "radius": radius,
            "fill": fill_color,
            "stroke": stroke_color,
            "strokeWidth": stroke_width,
            "rotation": 0
        }
        
        canvas_data["objects"].append(hexagon_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added hexagon: radius {radius}",
                "canvas_data": canvas_data,
                "element": hexagon_element
            }
        else:
            return {"success": False, "error": "Failed to add hexagon"}
    except Exception as e:
        logger.error(f"Error adding hexagon: {e}")
        return {"success": False, "error": str(e)}

async def _add_icon(self, user_id: str, design_id: str, icon_name: str, x: int = None, y: int = None, width: int = 60, height: int = 60) -> Dict[str, Any]:
    """Add an icon from the icon library to the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        if not canvas_data.get("objects"):
            canvas_data["objects"] = []
        
        # Default position to center if not provided
        if x is None:
            x = canvas_data.get("width", 800) // 2 - width // 2
        if y is None:
            y = canvas_data.get("height", 400) // 2 - height // 2
        
        # Find the icon in our library
        icon_info = _find_icon_by_name(icon_name)
        if not icon_info:
            return {"success": False, "error": f"Icon '{icon_name}' not found in library"}
        
        icon_element = {
            "id": f"icon_{int(time.time())}_{len(canvas_data['objects'])}",
            "type": "image",
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "image": icon_info["imagePath"],
            "rotation": 0,
            "assetName": icon_name,
            "iconName": icon_name,
            "category": icon_info["category"]
        }
        
        canvas_data["objects"].append(icon_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Added icon: {icon_name}",
                "canvas_data": canvas_data,
                "element": icon_element
            }
        else:
            return {"success": False, "error": "Failed to add icon"}
    except Exception as e:
        logger.error(f"Error adding icon: {e}")
        return {"success": False, "error": str(e)}

async def _list_available_icons(self, category: str = None) -> Dict[str, Any]:
    """Get list of available icons by category"""
    try:
        icon_library = _get_icon_library()
        
        if category:
            filtered_icons = [icon for icon in icon_library if icon["category"] == category]
            return {
                "success": True,
                "message": f"Found {len(filtered_icons)} icons in category '{category}'",
                "icons": filtered_icons,
                "category": category,
                "count": len(filtered_icons)
            }
        else:
            # Group by category
            categories = {}
            for icon in icon_library:
                cat = icon["category"]
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(icon)
            
            return {
                "success": True,
                "message": f"Found {len(icon_library)} icons across {len(categories)} categories",
                "icons": icon_library,
                "categories": categories,
                "count": len(icon_library)
            }
    except Exception as e:
        logger.error(f"Error listing icons: {e}")
        return {"success": False, "error": str(e)}

    async def _add_qr_code(self, user_id: str, design_id: str, url: str, x: int = None, y: int = None, width: int = 200, height: int = 200, qr_color: str = "#000000", background_color: str = "#ffffff") -> Dict[str, Any]:
        """Add QR code element to the design - generates real QR code like sidebar"""
        try:
            # If design_id is provided, try to get existing design
            canvas_data = None
            if design_id:
                from database import db_manager
                design = await db_manager.get_design(design_id)
                if design:
                    canvas_data = design.get("canvas_data", {})
            
            # If no existing design or design_id not provided, create new canvas data
            if not canvas_data:
                canvas_data = {
                    "version": "2.0",
                    "width": 800,
                    "height": 400,
                    "background": "#ffffff",
                    "objects": []
                }
            
            if not canvas_data.get("objects"):
                canvas_data["objects"] = []
            
            # Default position to center if not provided
            if x is None:
                x = canvas_data.get("width", 800) // 2 - width // 2
            if y is None:
                y = canvas_data.get("height", 400) // 2 - height // 2
            
            # Generate QR code using qrcode library (Python backend)
            import qrcode
            from io import BytesIO
            import base64
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=4,
            )
            qr.add_data(url)
            qr.make(fit=True)
            
            # Create QR code image
            qr_img = qr.make_image(fill_color=qr_color, back_color=background_color)
            
            # Convert to base64 data URL
            buffer = BytesIO()
            qr_img.save(buffer, format='PNG')
            qr_data_url = f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
            
            # Create QR code element as image type (same as sidebar implementation)
            qr_element = {
                "id": f"qrcode_{int(time.time())}_{len(canvas_data['objects'])}",
                "type": "image", # Use 'image' type like sidebar
                "x": x, 
                "y": y, 
                "width": width, 
                "height": height,
                "rotation": 0,
                "assetName": "QR Code",
                "qrData": {
                    "url": url,
                    "color": qr_color,
                    "backgroundColor": background_color
                },
                "imageDataUrl": qr_data_url # Store the generated QR code image
            }
            
            canvas_data["objects"].append(qr_element)
            
            # For direct canvas manipulation, we don't need to save to database immediately
            # The frontend will handle the canvas update
            return {
                "success": True,
                "message": f"Generated QR code for: {url}",
                "canvas_data": canvas_data,
                "design_data": {
                    "design_id": design_id or f"temp_{int(time.time())}",
                    "canvas_data": canvas_data
                },
                "element": qr_element,
                "direct_manipulation": True  # Flag to indicate this is direct canvas manipulation
            }
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return {"success": False, "error": str(e)}

async def _move_element(self, user_id: str, design_id: str, element_id: str, x: int, y: int) -> Dict[str, Any]:
    """Move an element to a new position"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id:
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Element not found"}
        
        # Update position
        objects[element_index]["x"] = x
        objects[element_index]["y"] = y
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Moved element to ({x}, {y})",
                "canvas_data": canvas_data,
                "element": objects[element_index]
            }
        else:
            return {"success": False, "error": "Failed to move element"}
    except Exception as e:
        logger.error(f"Error moving element: {e}")
        return {"success": False, "error": str(e)}

async def _resize_element(self, user_id: str, design_id: str, element_id: str, width: int, height: int) -> Dict[str, Any]:
    """Resize an element"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id:
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Element not found"}
        
        # Update size
        objects[element_index]["width"] = width
        objects[element_index]["height"] = height
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Resized element to {width}x{height}",
                "canvas_data": canvas_data,
                "element": objects[element_index]
            }
        else:
            return {"success": False, "error": "Failed to resize element"}
    except Exception as e:
        logger.error(f"Error resizing element: {e}")
        return {"success": False, "error": str(e)}

async def _change_element_color(self, user_id: str, design_id: str, element_id: str, fill_color: str = None, stroke_color: str = None) -> Dict[str, Any]:
    """Change the color of an element"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id:
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Element not found"}
        
        # Update colors
        if fill_color is not None:
            objects[element_index]["fill"] = fill_color
        if stroke_color is not None:
            objects[element_index]["stroke"] = stroke_color
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Changed element colors",
                "canvas_data": canvas_data,
                "element": objects[element_index]
            }
        else:
            return {"success": False, "error": "Failed to change element color"}
    except Exception as e:
        logger.error(f"Error changing element color: {e}")
        return {"success": False, "error": str(e)}

async def _delete_element(self, user_id: str, design_id: str, element_id: str) -> Dict[str, Any]:
    """Delete an element from the design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find and remove the element
        original_count = len(objects)
        objects[:] = [obj for obj in objects if obj.get("id") != element_id]
        
        if len(objects) == original_count:
            return {"success": False, "error": "Element not found"}
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Deleted element: {element_id}",
                "canvas_data": canvas_data
            }
        else:
            return {"success": False, "error": "Failed to delete element"}
    except Exception as e:
        logger.error(f"Error deleting element: {e}")
        return {"success": False, "error": str(e)}

async def _duplicate_element(self, user_id: str, design_id: str, element_id: str, x_offset: int = 20, y_offset: int = 20) -> Dict[str, Any]:
    """Duplicate an element"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element to duplicate
        original_element = None
        for obj in objects:
            if obj.get("id") == element_id:
                original_element = obj
                break
        
        if not original_element:
            return {"success": False, "error": "Element not found"}
        
        # Create duplicate with new ID and offset position
        duplicate_element = original_element.copy()
        duplicate_element["id"] = f"{element_id}_copy_{int(time.time())}"
        duplicate_element["x"] = original_element.get("x", 0) + x_offset
        duplicate_element["y"] = original_element.get("y", 0) + y_offset
        
        objects.append(duplicate_element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Duplicated element: {element_id}",
                "canvas_data": canvas_data,
                "element": duplicate_element
            }
        else:
            return {"success": False, "error": "Failed to duplicate element"}
    except Exception as e:
        logger.error(f"Error duplicating element: {e}")
        return {"success": False, "error": str(e)}

async def _bring_to_front(self, user_id: str, design_id: str, element_id: str) -> Dict[str, Any]:
    """Bring element to front layer"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id:
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Element not found"}
        
        # Move element to the end (front layer)
        element = objects.pop(element_index)
        objects.append(element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Brought element to front",
                "canvas_data": canvas_data,
                "element": element
            }
        else:
            return {"success": False, "error": "Failed to bring element to front"}
    except Exception as e:
        logger.error(f"Error bringing element to front: {e}")
        return {"success": False, "error": str(e)}

async def _send_to_back(self, user_id: str, design_id: str, element_id: str) -> Dict[str, Any]:
    """Send element to back layer"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        canvas_data = design.get("canvas_data", {})
        objects = canvas_data.get("objects", [])
        
        # Find the element
        element_index = None
        for i, obj in enumerate(objects):
            if obj.get("id") == element_id:
                element_index = i
                break
        
        if element_index is None:
            return {"success": False, "error": "Element not found"}
        
        # Move element to the beginning (back layer)
        element = objects.pop(element_index)
        objects.insert(0, element)
        
        result = await db_manager.update_design(design_id, {"canvas_data": canvas_data})
        if result.get("success"):
            return {
                "success": True,
                "message": f"Sent element to back",
                "canvas_data": canvas_data,
                "element": element
            }
        else:
            return {"success": False, "error": "Failed to send element to back"}
    except Exception as e:
        logger.error(f"Error sending element to back: {e}")
        return {"success": False, "error": str(e)}

async def _save_design(self, user_id: str, design_id: str, name: str = None) -> Dict[str, Any]:
    """Save the current design"""
    try:
        from database import db_manager
        design = await db_manager.get_design(design_id)
        if not design:
            return {"success": False, "error": "Design not found"}
        
        # Update the design name if provided
        update_data = {}
        if name:
            update_data["name"] = name
        
        # Mark as saved/updated
        update_data["updated_at"] = datetime.now().isoformat()
        
        result = await db_manager.update_design(design_id, update_data)
        if result.get("success"):
            return {
                "success": True,
                "message": f"Saved design: {name or design.get('name', 'Untitled')}",
                "design_id": design_id
            }
        else:
            return {"success": False, "error": "Failed to save design"}
    except Exception as e:
        logger.error(f"Error saving design: {e}")
        return {"success": False, "error": str(e)}

# Helper methods for icon library
def _get_icon_library() -> List[Dict[str, Any]]:
    """Get the complete icon library"""
    return [
        # Medical & Healthcare
        {"name": "Doctor", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Doctor.svg"},
        {"name": "Nurse", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Nurse.svg"},
        {"name": "Hospital Building", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Hospital.svg"},
        {"name": "Medical Kit", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medical Kit.svg"},
        {"name": "Stethoscope", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Phonendoscope.svg"},
        {"name": "Thermometer", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Thermometer.svg"},
        {"name": "Syringe", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Syringe.svg"},
        {"name": "Pills", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medicine.svg"},
        {"name": "Capsule", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Capsule.svg"},
        {"name": "Microscope", "category": "medical", "imagePath": "/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Microscope.svg"},
        
        # Social Media
        {"name": "X (Twitter)", "category": "social", "imagePath": "/assets/images/social icons/X.png"},
        {"name": "Twitter", "category": "social", "imagePath": "/assets/images/social icons/Twitter.png"},
        {"name": "Meta (Facebook)", "category": "social", "imagePath": "/assets/images/social icons/Facebook.png"},
        {"name": "LinkedIn", "category": "social", "imagePath": "/assets/images/social icons/LinkedIn.png"},
        {"name": "Reddit", "category": "social", "imagePath": "/assets/images/social icons/Reddit.png"},
        {"name": "Pinterest", "category": "social", "imagePath": "/assets/images/social icons/Pinterest.png"},
        {"name": "Instagram", "category": "social", "imagePath": "/assets/images/social icons/Instagram.png"},
        {"name": "Snapchat", "category": "social", "imagePath": "/assets/images/social icons/Snapchat.png"},
        {"name": "Telegram", "category": "social", "imagePath": "/assets/images/social icons/Telegram.png"},
        {"name": "WhatsApp", "category": "social", "imagePath": "/assets/images/social icons/Whatsapp.png"},
        {"name": "Twitch", "category": "social", "imagePath": "/assets/images/social icons/Twitch.png"},
        {"name": "YouTube", "category": "social", "imagePath": "/assets/images/social icons/Youtube.png"},
        {"name": "TikTok", "category": "social", "imagePath": "/assets/images/social icons/Tiktok.png"},
        {"name": "Discord", "category": "social", "imagePath": "/assets/images/social icons/Discord.png"},
        {"name": "Slack", "category": "social", "imagePath": "/assets/images/social icons/Slack.png"},
        {"name": "Zoom", "category": "social", "imagePath": "/assets/images/social icons/Zoom.png"},
        
        # Technology & Business
        {"name": "Technology", "category": "technology", "imagePath": "/assets/images/icons/Technology.svg"},
        {"name": "Data Analytics", "category": "technology", "imagePath": "/assets/images/icons/Data Analytic.svg"},
        {"name": "User Experience", "category": "technology", "imagePath": "/assets/images/icons/User Experience.svg"},
        {"name": "Passive Income", "category": "technology", "imagePath": "/assets/images/icons/Passive Income.svg"},
        {"name": "Valuations", "category": "technology", "imagePath": "/assets/images/icons/Valuations.svg"},
        {"name": "Blue Print", "category": "technology", "imagePath": "/assets/images/icons/Blue Print.svg"},
        {"name": "Anti Virus", "category": "technology", "imagePath": "/assets/images/icons/Anti Virus.svg"},
        {"name": "Manager", "category": "technology", "imagePath": "/assets/images/icons/Manager.svg"},
        {"name": "Digital Agreement", "category": "technology", "imagePath": "/assets/images/icons/Digital Agreement.svg"},
        {"name": "Growth", "category": "technology", "imagePath": "/assets/images/icons/Growth.svg"},
        {"name": "Sync Data", "category": "technology", "imagePath": "/assets/images/icons/Sync Data.svg"},
        {"name": "Project Management", "category": "technology", "imagePath": "/assets/images/icons/Project Management.svg"},
        {"name": "Startup", "category": "technology", "imagePath": "/assets/images/icons/Startup.svg"},
        {"name": "Development", "category": "technology", "imagePath": "/assets/images/icons/Development.svg"},
        {"name": "Digital Marketing", "category": "technology", "imagePath": "/assets/images/icons/Digital Marketing.svg"},
        {"name": "User Security", "category": "technology", "imagePath": "/assets/images/icons/User Security.svg"},
        {"name": "Affiliate", "category": "technology", "imagePath": "/assets/images/icons/Affiliate.svg"},
        {"name": "Registration", "category": "technology", "imagePath": "/assets/images/icons/Registration.svg"},
        {"name": "Budget", "category": "technology", "imagePath": "/assets/images/icons/Budget.svg"},
        {"name": "SEO", "category": "technology", "imagePath": "/assets/images/icons/SEO.svg"},
        {"name": "Teamwork", "category": "technology", "imagePath": "/assets/images/icons/Teamwork.svg"},
        
        # Food & Dining
        {"name": "Lollipop", "category": "food", "imagePath": "/assets/images/food/Lollipop.svg"},
        {"name": "Tart", "category": "food", "imagePath": "/assets/images/food/Tart.svg"},
        {"name": "Pancake", "category": "food", "imagePath": "/assets/images/food/Pancake.svg"},
        {"name": "Ramen", "category": "food", "imagePath": "/assets/images/food/Ramen.svg"},
        {"name": "Dimsum", "category": "food", "imagePath": "/assets/images/food/Dimsum.svg"},
        {"name": "Cheese", "category": "food", "imagePath": "/assets/images/food/Cheese.svg"},
        {"name": "Baguette", "category": "food", "imagePath": "/assets/images/food/Baguette.svg"},
        {"name": "Sausage", "category": "food", "imagePath": "/assets/images/food/Sausage.svg"},
        {"name": "Muffin", "category": "food", "imagePath": "/assets/images/food/Muffin.svg"},
        {"name": "Sushi", "category": "food", "imagePath": "/assets/images/food/Sushi.svg"},
        {"name": "Fries", "category": "food", "imagePath": "/assets/images/food/Fries.svg"},
        {"name": "Banana", "category": "food", "imagePath": "/assets/images/food/Banana.svg"},
        {"name": "Pizza", "category": "food", "imagePath": "/assets/images/food/Pizza.svg"},
        {"name": "Boba", "category": "food", "imagePath": "/assets/images/food/Boba.svg"}
    ]

def _find_icon_by_name(icon_name: str) -> Dict[str, Any]:
    """Find an icon by name in the library"""
    icon_library = _get_icon_library()
    for icon in icon_library:
        if icon["name"].lower() == icon_name.lower():
            return icon
    return None

# Add the methods to the class
AIAgentAdapter._create_new_design = _create_new_design
AIAgentAdapter._change_canvas_size = _change_canvas_size
AIAgentAdapter._change_background_color = _change_background_color
AIAgentAdapter._add_text = _add_text
AIAgentAdapter._modify_text = _modify_text
AIAgentAdapter._add_rectangle = _add_rectangle
AIAgentAdapter._add_circle = _add_circle
AIAgentAdapter._add_star = _add_star
AIAgentAdapter._add_triangle = _add_triangle
AIAgentAdapter._add_hexagon = _add_hexagon
AIAgentAdapter._add_icon = _add_icon
AIAgentAdapter._list_available_icons = _list_available_icons
AIAgentAdapter._get_icon_library = _get_icon_library
AIAgentAdapter._find_icon_by_name = _find_icon_by_name
AIAgentAdapter._move_element = _move_element
AIAgentAdapter._resize_element = _resize_element
AIAgentAdapter._change_element_color = _change_element_color
AIAgentAdapter._delete_element = _delete_element
AIAgentAdapter._duplicate_element = _duplicate_element
AIAgentAdapter._bring_to_front = _bring_to_front
AIAgentAdapter._send_to_back = _send_to_back
AIAgentAdapter._save_design = _save_design

# Initialize OpenAI client at module import time (like Supabase)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    try:
        ai_agent_adapter.openai_client = AsyncOpenAI(
            api_key=openai_api_key,
            http_client=httpx.AsyncClient()
        )
        ai_agent_adapter._initialized = True
        logger.info("✅ OpenAI client initialized successfully at startup")
    except Exception as e:
        logger.error(f"❌ Failed to initialize OpenAI client at startup: {e}")
        ai_agent_adapter._initialized = False
else:
    logger.warning("⚠️ OPENAI_API_KEY environment variable not set. AI features will be disabled.")
    logger.warning("Server will start but AI operations will fail gracefully.")
    ai_agent_adapter._initialized = False
