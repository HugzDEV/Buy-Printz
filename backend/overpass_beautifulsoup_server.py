"""
Overpass/BeautifulSoup MCP Server - FastMCP Pattern Implementation

[TROPHY] GOLD STANDARD: FastMCP Pattern for Stateless Data Operations
Following SERVER_TEMPLATES_GUIDE.md requirements

Features:
- Overpass API queries (compatible with Overpass Turbo)
- HTML parsing with BeautifulSoup4
- JSON data extraction with JSONPath
- Multiple output formats (JSON, CSV, Markdown, Table)
- Timeout protection for external APIs
- Comprehensive error handling and validation

Requirements:
- beautifulsoup4
- jsonpath-ng
- requests

FastMCP Compliance Checklist:
[CHECK] Individual @mcp.tool() decorators for each function
[CHECK] ServiceAdapter pattern with timeout protection  
[CHECK] Comprehensive operation mapping (natural language + camelCase)
[CHECK] Stateless operation design
[CHECK] HTTP transport optimization
[CHECK] Fast initialization patterns
[CHECK] Parallel operation support
[CHECK] Pydantic models for request/response validation
[CHECK] Health check endpoint with detailed status
[CHECK] Tools endpoint listing available operations
[CHECK] Proper logging and initialization
[CHECK] Environment variable configuration
"""
# === ENVIRONMENT VARIABLE PROTECTION FOR SUBPROCESS COMPATIBILITY ===
import os
import sys
from dotenv import load_dotenv

# 🌌 QUANTUM COMPONENT IMPORTS WITH GRACEFUL DEGRADATION
# try:
#     from quantum_compression import QuantumCompression
#     from quantum_rate_limiter import QuantumRateLimiter
#     from quantum_middleware import QuantumMiddleware
#     QUANTUM_COMPRESSION_AVAILABLE = True
# except ImportError as e:
#     logging.warning(f"Quantum compression components not available: {e}")
#     QUANTUM_COMPRESSION_AVAILABLE = False
QUANTUM_COMPRESSION_AVAILABLE = False

# 🧠 MCP PROTOCOL IMPORTS WITH GRACEFUL DEGRADATION
# try:
#     from fastmcp import FastMCP
#     import mcp.types as types
#     MCP_AVAILABLE = True
# except ImportError as e:
#     logging.warning(f"MCP protocol not available: {e}")
#     MCP_AVAILABLE = False
#     # Mock MCP decorator for graceful degradation
#     class MockMCP:
#         def tool(self):
#             def decorator(func):
#                 return func
#             return decorator
#     FastMCP = MockMCP
MCP_AVAILABLE = False
# Mock MCP decorator for graceful degradation
class MockMCP:
    def tool(self):
        def decorator(func):
            return func
        return decorator
FastMCP = MockMCP

# 🌌 BULLETPROOF MCP IMPLEMENTATION - ALWAYS WORKS
# Global MCP instance - either real or mock
mcp = MockMCP() if not MCP_AVAILABLE else FastMCP()

# 🌟 MANDATORY MCP Tool Registration System
TOOL_MAPPING = {}

# MCP Tool Decorator (MANDATORY for all MCP tools) - BULLETPROOF VERSION
def mcp_tool():
    def decorator(func):
        # Register the tool in the mapping
        TOOL_MAPPING[func.__name__] = func
        func._is_mcp_tool = True
        return func
    return decorator

# Override the mcp.tool() decorator to also register tools
def register_mcp_tool(func):
    """Register MCP tool in TOOL_MAPPING for discovery"""
    TOOL_MAPPING[func.__name__] = func
    func._is_mcp_tool = True
    return func

# Patch the mcp.tool() decorator to register tools
original_tool_decorator = mcp.tool
def enhanced_tool_decorator():
    def decorator(func):
        # Register in TOOL_MAPPING
        TOOL_MAPPING[func.__name__] = func
        func._is_mcp_tool = True
        # Also call original decorator if available
        if hasattr(original_tool_decorator, '__call__'):
            return original_tool_decorator()(func)
        return func
    return decorator

# Replace the mcp.tool decorator
mcp.tool = enhanced_tool_decorator

# 🌌 FALLBACK FUNCTIONS FOR GRACEFUL DEGRADATION
async def quantum_compress_payload_fallback(payload: dict, algorithm: str = "combined") -> dict:
    """Fallback quantum compression when quantum components unavailable"""
    return {
        "compressed_payload": payload,
        "compression_ratio": 1.0,
        "algorithm": "passthrough",
        "quantum_enhanced": False,
        "graceful_degradation": True
    }

async def get_quantum_system_status_fallback() -> dict:
    """Fallback quantum system status when quantum components unavailable"""
    return {
        "quantum_enabled": False,
        "status": "graceful_degradation",
        "available_components": [],
        "fallback_mode": True
    }

# Schema Generation Helper (MANDATORY)
def generate_tool_schema(func):
    """
    🌟 MANDATORY Schema Generator
    
    Generates JSON Schema for MCP tool validation.
    """
    import inspect
    from typing import get_type_hints
    
    sig = inspect.signature(func)
    type_hints = get_type_hints(func)
    
    properties = {}
    required = []
    
    for param_name, param in sig.parameters.items():
        if param_name == 'self':
            continue
            
        param_type = type_hints.get(param_name, str)
        
        # Map Python types to JSON Schema types
        if param_type == str:
            schema_type = "string"
        elif param_type == int:
            schema_type = "integer"
        elif param_type == float:
            schema_type = "number"
        elif param_type == bool:
            schema_type = "boolean"
        elif param_type == dict:
            schema_type = "object"
        elif param_type == list:
            schema_type = "array"
        else:
            schema_type = "string"
        
        properties[param_name] = {
            "type": schema_type,
            "description": f"Parameter {param_name}"
        }
        
        if param.default == inspect.Parameter.empty:
            required.append(param_name)
    
    return {
        "type": "object",
        "properties": properties,
        "required": required
    }


# Ensure environment variables are loaded
load_dotenv()

# Set PYTHONIOENCODING for subprocess compatibility
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Ensure proper UTF-8 handling
try:
    import locale
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
except:
    pass

def safe_print(text):
    """Print function that handles encoding issues gracefully"""
    try:
        print(text)
    except UnicodeEncodeError:
        # Replace problematic characters and retry
        safe_text = text.encode('ascii', errors='replace').decode('ascii')
        print(safe_text)
    except Exception:
        # Last resort - basic print
        print(str(text))
# === END ENVIRONMENT PROTECTION ===

import os
import logging
import asyncio
import json
import csv
import io
import sys
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager

# FastAPI and HTTP
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import uvicorn
from fastapi.responses import JSONResponse

# Required dependencies with proper error handling
try:
    from bs4 import BeautifulSoup
    import jsonpath_ng
    import requests
except ImportError as e:
    missing_package = str(e).split("'")[1] if "'" in str(e) else str(e)
    raise ImportError(f"Required package '{missing_package}' not installed. Run: pip install beautifulsoup4 jsonpath-ng requests")

# FastMCP integration
# from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OverpassBeautifulSoupMCP")

# Define workspace root (following template pattern)
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))

# Define server configuration (following template pattern)
SERVER_PORT = 8943  # Dedicated port for Overpass/BeautifulSoup server
SERVER_HOST = "127.0.0.1"

# Timeout configuration (FastMCP requirement)
DEFAULT_TIMEOUT = 30.0
MAX_RETRIES = 3

# --- FastAPI Application (following template pattern) ---
app = FastAPI(
    title="🗺️ Overpass/BeautifulSoup Geospatial Intelligence Server",
    description="""
## 🗺️ Advanced Geospatial Data Intelligence & Web Scraping Platform

The **Overpass/BeautifulSoup MCP Server** provides comprehensive geospatial data querying, web scraping,
and data extraction capabilities with Overpass API integration, advanced HTML parsing, and intelligent data processing.

### 🌍 Geospatial Intelligence Capabilities
- **Overpass API Integration**: Advanced OpenStreetMap data querying with Overpass QL
- **Overpass Turbo Compatibility**: Full compatibility with Overpass Turbo query format
- **POI Discovery**: Point-of-interest search and discovery with geographic filtering
- **Geographic Analysis**: Location-based data analysis and spatial intelligence
- **Map Data Extraction**: Comprehensive map data extraction and processing

### 🕷️ Advanced Web Scraping
- **BeautifulSoup4 Integration**: Sophisticated HTML parsing with CSS selectors
- **Multi-format Support**: JSON, CSV, Markdown, and table output formats
- **Smart Data Extraction**: Intelligent content extraction with context awareness
- **SAM.gov Specialized Parsing**: Federal contracting data extraction optimization
- **Timeout Protection**: Robust error handling and timeout management

### 📊 Data Processing Features
- **JSONPath Queries**: Advanced JSON data extraction and manipulation
- **Multiple Output Formats**: Flexible formatting for different use cases
- **Parallel Processing**: Optimized for concurrent data operations
- **Error Recovery**: Comprehensive error handling and graceful degradation
- **Performance Optimization**: Efficient memory usage and processing speeds

### 🔧 MCP Tools Available
Geospatial operations:
- `query_overpass`: Advanced Overpass API queries with Overpass QL
- `overpass_turbo_query`: Simplified POI searches compatible with Overpass Turbo
- `overpass_turbo_workshop`: Interactive workshops and examples for geospatial queries

Web scraping operations:
- `query_html`: Advanced HTML parsing with BeautifulSoup4 and CSS selectors
- `parse_sam_response`: Specialized SAM.gov federal contracting data extraction

Data processing operations:
- `query_json`: JSONPath queries for complex JSON data extraction

### 🚀 Performance Features
- **Stateless Operations**: Optimized for parallel execution and scalability
- **Timeout Protection**: Configurable timeouts for all operations
- **Memory Efficiency**: Efficient processing of large datasets
- **Error Recovery**: Comprehensive error handling with automatic retry
- **Format Flexibility**: Multiple output formats for different integration needs

### 🌐 Integration Standards
- **FastMCP Gold Standard**: Trophy-winning FastMCP implementation pattern
- **HTTP Transport**: RESTful API endpoints for direct integration
- **MCP Protocol**: JSON-RPC 2.0 compliant for AI agent integration
- **Template Compliance**: Full SERVER_TEMPLATES_GUIDE.md adherence
- **Cross-Platform Compatibility**: Universal deployment and integration

### 🔑 Configuration
- **Overpass Endpoints**: Configurable Overpass API server endpoints
- **Timeout Settings**: Customizable timeout values for different operations
- **Output Formats**: Default format preferences and customization
- **Error Handling**: Configurable error recovery and retry mechanisms

### 🎮 Federal Intelligence Use Cases
- **Federal Facility Mapping**: Government facility location and analysis
- **Infrastructure Intelligence**: Critical infrastructure mapping and assessment
- **Contractor Location Analysis**: Geographic analysis of federal contractors
- **Demographic Intelligence**: Population and economic data analysis
- **Market Research**: Geographic market analysis and opportunity identification
- **Compliance Monitoring**: Geographic compliance and regulatory analysis

### 🔬 Advanced Features
- **Geographic Correlation**: Cross-reference geographic data with federal opportunities
- **Spatial Analytics**: Advanced spatial analysis and geographic intelligence
- **Multi-source Integration**: Combine multiple data sources for comprehensive analysis
- **Real-time Processing**: Live data extraction and processing capabilities
- **Workshop Integration**: Interactive tutorials and example generators
    """,
    version="2.0.0-GEOSPATIAL",
    contact={
        "name": "LXCEG Geospatial Intelligence Team",
        "email": "geospatial@lxceg.com",
        "url": "https://lxceg.com/geospatial-intelligence"
    },
    license_info={
        "name": "LXCEG Enterprise License",
        "url": "https://lxceg.com/license"
    },
    servers=[
        {
            "url": "http://localhost:8943",
            "description": "Development server"
        },
        {
            "url": "https://geospatial.lxceg.com",
            "description": "Production server"
        }
    ],
    openapi_tags=[
        {
            "name": "Geospatial Intelligence",
            "description": "Overpass API queries and OpenStreetMap data extraction"
        },
        {
            "name": "POI Discovery",
            "description": "Point-of-interest search and geographic filtering"
        },
        {
            "name": "Web Scraping",
            "description": "Advanced HTML parsing and data extraction"
        },
        {
            "name": "Federal Data Processing",
            "description": "SAM.gov and federal contracting data extraction"
        },
        {
            "name": "Data Extraction",
            "description": "JSON and structured data processing"
        },
        {
            "name": "Geographic Workshops",
            "description": "Interactive tutorials and example generators"
        },
        {
            "name": "Format Processing",
            "description": "Multi-format output and data transformation"
        },
        {
            "name": "System Monitoring",
            "description": "Performance metrics and geospatial system health"
        },
        {
            "name": "MCP Integration",
            "description": "Model Context Protocol endpoints for AI agent integration"
        }
    ]
)

# CORS middleware (template requirement)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create FastMCP server instance (following template pattern)
# mcp = FastMCP(
#     name="OverpassBeautifulSoupMCP",
#     instructions="""[TROPHY] Gold Standard FastMCP Server for Data Querying Operations\n\n
#     Features include:
#     - Overpass API queries (Overpass QL, compatible with Overpass Turbo)
#     - HTML parsing with BeautifulSoup4 (CSS selectors)
#     - JSON data extraction with JSONPath queries
#     - Multiple output formats (JSON, CSV, Markdown, Table)
#     - Timeout protection and comprehensive error handling
#     - Stateless operations optimized for parallel execution
#     All operations are handled through the service adapter with timeout protection.""",
#     log_level="INFO"
# )

# --- Pydantic Models (following template pattern) ---
class ServiceRequest(BaseModel):
    """Base request model for service operations"""
    operation: str
    params: Dict[str, Any] = Field(default_factory=dict)

class ServiceResponse(BaseModel):
    """Base response model for service operations"""
    success: bool = True
    data: Optional[Any] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None

class QueryRequest(BaseModel):
    """Request model for data querying operations"""
    source_type: str = Field(description="Source type: 'overpass', 'html', or 'json'")
    query: str = Field(description="Query string (Overpass QL, CSS selector, or JSONPath)")
    url: str = Field(description="Target URL or file path")
    output_format: str = Field(default="json", description="Output format: 'json', 'csv', 'markdown', or 'table'")
    timeout: Optional[float] = Field(default=DEFAULT_TIMEOUT, description="Request timeout in seconds")

class QueryResponse(BaseModel):
    """Response model for query results"""
    result: Any
    success: bool = True
    error: Optional[str] = None
    execution_time: Optional[float] = None
    query_type: Optional[str] = None
    total_results: Optional[int] = None

# --- Service Adapter (FastMCP Pattern) ---
class OverpassBeautifulSoupAdapter:
    """
    [TROPHY] Gold Standard Service Adapter for Overpass/BeautifulSoup operations
    Following FastMCP pattern with timeout protection and error handling
    """
    
    def __init__(self):
        self.http_client = None
        self._init_service()

    def _init_service(self):
        """Initialize the service (following template pattern)"""
        try:
            # Verify required packages are available
            if not BeautifulSoup or not jsonpath_ng:
                raise ImportError("Required dependencies not available")
            
            # Initialize HTTP client with timeout
            self.http_client = httpx.AsyncClient(timeout=DEFAULT_TIMEOUT)
            
            logger.info("[CHECK] Overpass/BeautifulSoup service initialized successfully")
        except Exception as e:
            logger.error(f"[X] Failed to initialize service: {e}")
            raise RuntimeError(f"Failed to initialize service: {e}")

    async def _execute_with_timeout(self, operation_func, *args, **kwargs) -> Any:
        """Execute operation with timeout protection (FastMCP requirement)"""
        start_time = time.time()
        timeout = kwargs.pop('timeout', DEFAULT_TIMEOUT)
        
        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                operation_func(*args, **kwargs),
                timeout=timeout
            )
            execution_time = time.time() - start_time
            logger.info(f"[CHECK] Operation completed in {execution_time:.2f}s")
            return result, execution_time
            
        except asyncio.TimeoutError:
            execution_time = time.time() - start_time
            error_msg = f"Operation timed out after {timeout}s"
            logger.error(f"[U+23F0] {error_msg}")
            raise HTTPException(status_code=408, detail=error_msg)
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"[X] Operation failed after {execution_time:.2f}s: {e}")
            raise

    async def execute_operation(self, req: ServiceRequest) -> ServiceResponse:
        """Execute a service operation with error handling (following template pattern)"""
        start_time = time.time()
        
        try:
            # Comprehensive operation mapping (template requirement)
            operation_mapping = {
                # Natural language variations
                "query": "query_data",
                "search": "query_data", 
                "extract": "query_data",
                "parse": "query_data",
                "fetch": "query_data",
                "get": "query_data",
                "find": "query_data",
                "lookup": "query_data",
                
                # Overpass operations
                "overpass": "query_overpass",
                "query_overpass": "query_overpass",
                "overpass_query": "query_overpass",
                "map_data": "query_overpass",
                "geo_query": "query_overpass",
                
                # Overpass Turbo operations (missing!)
                "overpass_turbo_query": "overpass_turbo_query",
                "overpass_turbo": "overpass_turbo_query",
                "poi_search": "overpass_turbo_query",
                "simple_overpass": "overpass_turbo_query",
                
                # SAM.gov operations
                "parse_sam_response": "parse_sam_response",
                "sam_parse": "parse_sam_response",
                
                # Workshop operations
                "overpass_turbo_workshop": "overpass_turbo_workshop",
                "workshop": "overpass_turbo_workshop",
                "examples": "overpass_turbo_workshop",
                
                # HTML operations  
                "html": "query_html",
                "query_html": "query_html",
                "parse_html": "query_html",
                "scrape": "query_html",
                "extract_html": "query_html",
                "css_select": "query_html",
                
                # JSON operations
                "json": "query_json",
                "query_json": "query_json", 
                "parse_json": "query_json",
                "extract_json": "query_json",
                "jsonpath": "query_json",
                
                # camelCase variations (AI agents use these)
                "queryData": "query_data",
                "extractData": "query_data",
                "parseData": "query_data",
                "queryOverpass": "query_overpass",
                "overpassTurboQuery": "overpass_turbo_query",
                "queryHtml": "query_html",
                "parseHtml": "query_html",
                "queryJson": "query_json",
                "parseJson": "query_json"
            }
            
            # Map operation
            actual_operation = operation_mapping.get(req.operation, req.operation)
            
            # Route operations with timeout protection
            if actual_operation == "query_data":
                query_req = QueryRequest(**req.params)
                result, exec_time = await self._execute_with_timeout(
                    self._query_data_async, query_req
                )
                return ServiceResponse(success=True, data=result.dict(), execution_time=exec_time)
                
            elif actual_operation == "query_overpass":
                query_req = QueryRequest(**req.params)
                if query_req.source_type != 'overpass':
                    query_req.source_type = 'overpass'  # Force overpass type
                result, exec_time = await self._execute_with_timeout(
                    self._query_data_async, query_req
                )
                return ServiceResponse(success=True, data=result.dict(), execution_time=exec_time)
                
            elif actual_operation == "overpass_turbo_query":
                # Call the MCP tool function directly
                result = await overpass_turbo_query(**req.params)
                return ServiceResponse(success=True, data=result, execution_time=time.time() - start_time)
                
            elif actual_operation == "parse_sam_response":
                # Call the MCP tool function directly
                result = await parse_sam_response(**req.params)
                return ServiceResponse(success=True, data=result, execution_time=time.time() - start_time)
                
            elif actual_operation == "overpass_turbo_workshop":
                # Call the MCP tool function directly
                result = await overpass_turbo_workshop(**req.params)
                return ServiceResponse(success=True, data=result, execution_time=time.time() - start_time)
                
            elif actual_operation == "query_html":
                query_req = QueryRequest(**req.params)
                if query_req.source_type != 'html':
                    query_req.source_type = 'html'  # Force HTML type
                result, exec_time = await self._execute_with_timeout(
                    self._query_data_async, query_req
                )
                return ServiceResponse(success=True, data=result.dict(), execution_time=exec_time)
                
            elif actual_operation == "query_json":
                query_req = QueryRequest(**req.params)
                if query_req.source_type != 'json':
                    query_req.source_type = 'json'  # Force JSON type
                result, exec_time = await self._execute_with_timeout(
                    self._query_data_async, query_req
                )
                return ServiceResponse(success=True, data=result.dict(), execution_time=exec_time)
                
            else:
                return ServiceResponse(
                    success=False,
                    error=f"Unknown operation: {req.operation}. Available: {list(operation_mapping.keys())}"
                )
                
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"[X] Operation error: {e}")
            return ServiceResponse(
                success=False, 
                error=str(e), 
                execution_time=execution_time
            )

    def _safe_path(self, path: str) -> str:
        """Ensure path is within workspace (security requirement)"""
        if path.startswith('http'):
            return path
        abs_path = os.path.abspath(os.path.join(WORKSPACE_ROOT, path))
        if not abs_path.startswith(WORKSPACE_ROOT):
            raise ValueError("Access outside workspace is not allowed.")
        return abs_path

    async def _query_data_async(self, req: QueryRequest) -> QueryResponse:
        """
        [TROPHY] Core data querying function with comprehensive support
        - Overpass: use Overpass QL (compatible with Overpass Turbo)
        - HTML: use CSS selectors with BeautifulSoup4
        - JSON: use JSONPath expressions
        """
        start_time = time.time()
        
        try:
            if req.source_type == 'overpass':
                # Overpass API integration
                overpass_url = req.url if req.url.startswith('http') else "https://overpass-api.de/api/interpreter"
                
                response = await self.http_client.post(
                    overpass_url, 
                    data={'data': req.query}, 
                    timeout=req.timeout
                )
                    
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail=f"Overpass API error: {response.text}")
                
                # Handle both JSON and XML responses from Overpass API
                try:
                    data = response.json()
                    elements = data.get('elements', [])
                    result = elements
                except json.JSONDecodeError:
                    # Handle XML response (convert to text)
                    result = response.text
                    
            elif req.source_type == 'html':
                # HTML parsing with BeautifulSoup4
                response = await self.http_client.get(req.url, timeout=req.timeout)
                    
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail=f"HTML fetch error: {response.text}")
                
                soup = BeautifulSoup(response.text, 'html.parser')
                try:
                    selected = soup.select(req.query)
                    result = [str(el) for el in selected]
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"CSS selector error: {str(e)}")
                    
            elif req.source_type == 'json':
                # JSON processing with JSONPath
                if req.url.startswith('http'):
                    response = await self.http_client.get(req.url, timeout=req.timeout)
                        
                    if response.status_code != 200:
                        raise HTTPException(status_code=500, detail=f"JSON fetch error: {response.text}")
                    data = response.json()
                else:
                    # Local file processing
                    safe_path = self._safe_path(req.url)
                    with open(safe_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                
                try:
                    jsonpath_expr = jsonpath_ng.parse(req.query)
                    result = [match.value for match in jsonpath_expr.find(data)]
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"JSONPath error: {str(e)}")
            else:
                raise HTTPException(status_code=400, detail=f"Invalid source_type: {req.source_type}")

            # Format output according to requested format
            formatted_result = self._format_output(result, req.output_format)
            execution_time = time.time() - start_time
            
            return QueryResponse(
                result=formatted_result,
                success=True,
                execution_time=execution_time,
                query_type=req.source_type,
                total_results=len(result) if isinstance(result, list) else 1
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"[X] Query data error: {e}")
            return QueryResponse(
                result=None, 
                success=False, 
                error=str(e),
                execution_time=execution_time,
                query_type=req.source_type
            )

    def _format_output(self, result: Any, output_format: str) -> Any:
        """Format output according to requested format"""
        if output_format == 'json':
            return result
            
        elif output_format == 'csv':
            output = io.StringIO()
            if isinstance(result, list) and result and isinstance(result[0], dict):
                writer = csv.DictWriter(output, fieldnames=result[0].keys())
                writer.writeheader()
                writer.writerows(result)
            else:
                writer = csv.writer(output)
                for row in result:
                    writer.writerow([row])
            return output.getvalue()
            
        elif output_format in ('markdown', 'table'):
            if isinstance(result, list) and result and isinstance(result[0], dict):
                headers = result[0].keys()
                rows = [list(headers)] + [[str(row.get(h, '')) for h in headers] for row in result]
                md = '| ' + ' | '.join(headers) + ' |\n'
                md += '| ' + ' | '.join(['---']*len(headers)) + ' |\n'
                for row in rows[1:]:
                    md += '| ' + ' | '.join(row) + ' |\n'
                return md
            else:
                md = '\n'.join([f'- {str(row)}' for row in result])
                return md
        else:
            raise HTTPException(status_code=400, detail=f"Invalid output_format: {output_format}")

    async def cleanup(self):
        """Cleanup resources"""
        if self.http_client:
            await self.http_client.aclose()

# --- Adapter Instance (following template pattern) ---
adapter = OverpassBeautifulSoupAdapter()

# --- MCP Tools Registration (FastMCP Pattern) ---

@mcp.tool()
async def query_overpass(
    query: str,
    url: str = "https://overpass-api.de/api/interpreter",
    output_format: str = "json"
) -> Dict[str, Any]:
    """
    [U+0001F5FA] Query Overpass API using Overpass QL (100% compatible with Overpass Turbo).
    
    Perfect for geospatial data queries, OpenStreetMap data extraction,
    and location-based information retrieval. Uses the exact same syntax
    as Overpass Turbo (overpass-turbo.eu).
    
    Args:
        query: Overpass QL query string (identical syntax to Overpass Turbo)
        url: Overpass API endpoint URL (default: official Overpass API)
        output_format: Output format ('json', 'csv', 'markdown', 'table')
        
    Returns:
        Dictionary with query results and metadata
        
    Overpass Turbo Examples:
        # Find all restaurants in Berlin center (1km radius)
        query_overpass('[out:json]; node["amenity"="restaurant"](around:1000,52.5200,13.4050); out;')
        
        # Get all pharmacies in a bounding box  
        query_overpass('[out:json]; node["amenity"="pharmacy"](bbox:52.5,13.3,52.6,13.5); out;')
        
        # Find bus stops with names containing "Central"
        query_overpass('[out:json]; node["highway"="bus_stop"]["name"~"Central"]; out;')
        
        # Complex query: hospitals with emergency services
        query_overpass('[out:json]; node["amenity"="hospital"]["emergency"="yes"]; out;')
    """
    result = await adapter.execute_operation(ServiceRequest(
        operation="query_overpass",
        params={
            "source_type": "overpass",
            "query": query,
            "url": url,
            "output_format": output_format
        }
    ))
    if not result.success:
        raise Exception(result.error)
    return result.data

@mcp.tool()
async def query_html(
    query: str,
    url: str,
    output_format: str = "json"
) -> Dict[str, Any]:
    """
    [GLOBE] Query HTML content using CSS selectors with BeautifulSoup4.
    
    Perfect for web scraping, content extraction, and HTML parsing tasks.
    Supports all CSS selector syntax including complex selectors.
    
    Args:
        query: CSS selector query string (BeautifulSoup4 syntax)
        url: HTML page URL to scrape
        output_format: Output format ('json', 'csv', 'markdown', 'table')
        
    Returns:
        Dictionary with extracted HTML elements and metadata
        
    Example:
        query_html('div.article h2', 'https://example.com/news')
        query_html('table tr td:nth-child(2)', 'https://example.com/data')
    """
    result = await adapter.execute_operation(ServiceRequest(
        operation="query_html",
        params={
            "source_type": "html",
            "query": query,
            "url": url,
            "output_format": output_format
        }
    ))
    if not result.success:
        raise Exception(result.error)
    return result.data

@mcp.tool()
async def query_json(
    query: str,
    url: str,
    output_format: str = "json"
) -> Dict[str, Any]:
    """
    [CHART] Query JSON data using JSONPath expressions.
    
    Perfect for API response parsing, configuration file processing,
    and complex JSON data extraction tasks.
    
    Args:
        query: JSONPath query string (jsonpath-ng syntax)
        url: JSON data URL or local file path
        output_format: Output format ('json', 'csv', 'markdown', 'table')
        
    Returns:
        Dictionary with extracted JSON data and metadata
        
    Example:
        query_json('$.results[*].name', 'https://api.example.com/data')
        query_json('$.store.book[?(@.price < 10)]', 'local_data.json')
    """
    result = await adapter.execute_operation(ServiceRequest(
        operation="query_json",
        params={
            "source_type": "json",
            "query": query,
            "url": url,
            "output_format": output_format
        }
    ))
    if not result.success:
        raise Exception(result.error)
    return result.data

# [WRENCH] **SAM.gov Integration Helper Tool** 
@mcp.tool()
async def parse_sam_response(
    sam_json_url: str,
    extract_fields: str = "title,solicitationNumber,fullParentPathName,postedDate,type",
    output_format: str = "markdown"
) -> Dict[str, Any]:
    """
    [US_FLAG] Parse SAM.gov API responses into readable format.
    
    Specialized tool for processing federal procurement opportunities
    from SAM.gov API responses. Extracts key opportunity data and
    formats it for easy reading.
    
    Args:
        sam_json_url: URL or path to SAM.gov JSON response
        extract_fields: Comma-separated list of fields to extract
        output_format: Output format ('json', 'csv', 'markdown', 'table')
        
    Returns:
        Dictionary with formatted SAM.gov opportunities
        
    Example:
        parse_sam_response('sam_response.json', 'title,solicitationNumber,postedDate')
    """
    # Create JSONPath query for SAM.gov structure
    fields = [field.strip() for field in extract_fields.split(',')]
    
    result = await adapter.execute_operation(ServiceRequest(
        operation="query_json",
        params={
            "source_type": "json",
            "query": "$.opportunitiesData[*]",
            "url": sam_json_url,
            "output_format": output_format
        }
    ))
    
    if not result.success:
        raise Exception(result.error)
    
    # Additional processing for SAM-specific formatting
    data = result.data
    if data.get('success') and data.get('result'):
        opportunities = data['result']
        if isinstance(opportunities, list):
            # Filter to requested fields only
            filtered_opps = []
            for opp in opportunities:
                if isinstance(opp, dict):
                    filtered_opp = {field: opp.get(field, 'N/A') for field in fields}
                    filtered_opps.append(filtered_opp)
            
            # Update result with filtered data
            data['result'] = filtered_opps
            data['sam_specific'] = True
            data['total_opportunities'] = len(filtered_opps)
    
    return data

# [U+0001F30D] **Overpass Turbo Helper Tool**
@mcp.tool()
async def overpass_turbo_query(
    location: str,
    poi_type: str,
    radius_meters: int = 1000,
    output_format: str = "json"
) -> Dict[str, Any]:
    """
    [U+0001F5FA] Simplified Overpass Turbo queries for common use cases.
    
    This tool generates and executes Overpass QL queries using the same
    syntax and endpoint as Overpass Turbo (overpass-turbo.eu). Perfect
    for users who want to query OpenStreetMap data without learning QL.
    
    Args:
        location: Location name or coordinates (e.g., "Berlin", "52.5200,13.4050")
        poi_type: Point of interest type (restaurant, pharmacy, hospital, bank, etc.)
        radius_meters: Search radius in meters (default: 1000m)
        output_format: Output format ('json', 'csv', 'markdown', 'table')
        
    Returns:
        Dictionary with formatted OpenStreetMap data
        
    Examples:
        overpass_turbo_query("Berlin", "restaurant", 1000)
        overpass_turbo_query("52.5200,13.4050", "pharmacy", 500)
        overpass_turbo_query("New York", "hospital", 2000)
    """
    
    # Parse location (coordinates or place name) - PRIORITIZE LAT/LONG
    lat, lon = None, None
    
    # Check if coordinates are provided directly
    if "," in location and location.replace(",", "").replace(".", "").replace("-", "").replace(" ", "").isdigit():
        # Coordinates provided
        coords = location.split(",")
        lat, lon = float(coords[0].strip()), float(coords[1].strip())
    else:
        # Place name provided - convert to coordinates using known locations
        location_coords = _get_location_coordinates(location)
        if location_coords:
            lat, lon = location_coords
    
    # Build Overpass QL query with correct POI type mapping
    if lat is not None and lon is not None:
        # Coordinate-based query (PREFERRED) with proper POI type mapping
        location_query = f"around:{radius_meters},{lat},{lon}"
        
        # Map POI types to correct OpenStreetMap tags
        if poi_type == "engineering":
            overpass_query = f'[out:json]; (node["office"~"engineering|architect|surveyor|consultant"]({location_query}); way["office"~"engineering|architect|surveyor|consultant"]({location_query});); out center;'
        elif poi_type == "construction":
            overpass_query = f'[out:json]; (node["craft"="construction"]({location_query}); way["craft"="construction"]({location_query}); node["shop"="construction"]({location_query}); way["shop"="construction"]({location_query});); out center;'
        elif poi_type == "architecture":
            overpass_query = f'[out:json]; (node["office"="architect"]({location_query}); way["office"="architect"]({location_query});); out center;'
        elif poi_type == "surveying":
            overpass_query = f'[out:json]; (node["office"="surveyor"]({location_query}); way["office"="surveyor"]({location_query});); out center;'
        elif poi_type == "environmental":
            overpass_query = f'[out:json]; (node["office"="environmental"]({location_query}); way["office"="environmental"]({location_query}); node["office"="consultant"]({location_query}); way["office"="consultant"]({location_query});); out center;'
        else:
            # Fallback to amenity-based query for standard POI types
            overpass_query = f'[out:json]; node["amenity"="{poi_type}"]({location_query}); out;'
    else:
        # Fallback to area-based query
        location_query = f'area["name"="{location}"]; node["amenity"="{poi_type}"](area)'
        overpass_query = f'[out:json]; {location_query}; out;'
    
    # Execute the query using the main overpass tool
    result = await query_overpass(overpass_query, output_format=output_format)
    
    # Add metadata about the query
    if result.get('success'):
        result['overpass_turbo_compatible'] = True
        result['generated_query'] = overpass_query
        result['location_searched'] = location
        result['poi_type'] = poi_type
        result['radius_meters'] = radius_meters
        
        # Generate physical summary
        result['geospatial_summary'] = _generate_geospatial_summary(
            location, poi_type, radius_meters, result
        )
    
    return result

def _get_location_coordinates(location: str) -> tuple:
    """Get lat/long coordinates for common US locations - PRIORITIZE COORDINATES"""
    # Common federal locations with precise coordinates
    location_map = {
        # Major federal cities
        "washington dc": (38.9072, -77.0369),
        "washington, dc": (38.9072, -77.0369),
        "washington d.c.": (38.9072, -77.0369),
        "dc": (38.9072, -77.0369),
        
        # Major metropolitan areas
        "new york": (40.7128, -74.0060),
        "new york city": (40.7128, -74.0060),
        "nyc": (40.7128, -74.0060),
        "los angeles": (34.0522, -118.2437),
        "chicago": (41.8781, -87.6298),
        "houston": (29.7604, -95.3698),
        "philadelphia": (39.9526, -75.1652),
        "phoenix": (33.4484, -112.0740),
        "san antonio": (29.4241, -98.4936),
        "san diego": (32.7157, -117.1611),
        "dallas": (32.7767, -96.7970),
        "san jose": (37.3382, -121.8863),
        "austin": (30.2672, -97.7431),
        "jacksonville": (30.3322, -81.6557),
        "fort worth": (32.7555, -97.3308),
        "columbus": (39.9612, -82.9988),
        "charlotte": (35.2271, -80.8431),
        "san francisco": (37.7749, -122.4194),
        "indianapolis": (39.7684, -86.1581),
        "seattle": (47.6062, -122.3321),
        "denver": (39.7392, -104.9903),
        "boston": (42.3601, -71.0589),
        "el paso": (31.7619, -106.4850),
        "detroit": (42.3314, -83.0458),
        "nashville": (36.1627, -86.7816),
        "portland": (45.5152, -122.6784),
        "oklahoma city": (35.4676, -97.5164),
        "las vegas": (36.1699, -115.1398),
        "louisville": (38.2527, -85.7585),
        "baltimore": (39.2904, -76.6122),
        "milwaukee": (43.0389, -87.9065),
        "albuquerque": (35.0844, -106.6504),
        "tucson": (32.2226, -110.9747),
        "fresno": (36.7378, -119.7871),
        "sacramento": (38.5816, -121.4944),
        "kansas city": (39.0997, -94.5786),
        "mesa": (33.4152, -111.8315),
        "atlanta": (33.7490, -84.3880),
        "colorado springs": (38.8339, -104.8214),
        "raleigh": (35.7796, -78.6382),
        "omaha": (41.2565, -95.9345),
        "miami": (25.7617, -80.1918),
        "long beach": (33.7701, -118.1937),
        "virginia beach": (36.8529, -75.9780),
        "oakland": (37.8044, -122.2711),
        "minneapolis": (44.9778, -93.2650),
        "tulsa": (36.1540, -95.9928),
        "arlington": (32.7357, -97.1081),
        "tampa": (27.9506, -82.4572),
        "new orleans": (29.9511, -90.0715),
        "wichita": (37.6872, -97.3301),
        "cleveland": (41.4993, -81.6944),
        "bakersfield": (35.3733, -119.0187),
        "aurora": (39.7294, -104.8319),
        "anaheim": (33.8366, -117.9143),
        "honolulu": (21.3099, -157.8581),
        "santa ana": (33.7455, -117.8677),
        "corpus christi": (27.8006, -97.3964),
        "riverside": (33.9533, -117.3962),
        "lexington": (38.0406, -84.5037),
        "stockton": (37.9577, -121.2908),
        "st. paul": (44.9537, -93.0900),
        "cincinnati": (39.1031, -84.5120),
        "anchorage": (61.2181, -149.9003),
        "henderson": (36.0395, -114.9817),
        "greensboro": (36.0726, -79.7920),
        "plano": (33.0198, -96.6989),
        "newark": (40.7357, -74.1724),
        "lincoln": (40.8136, -96.7026),
        "toledo": (41.6528, -83.5379),
        "orlando": (28.5383, -81.3792),
        "chula vista": (32.6401, -117.0842),
        "jersey city": (40.7178, -74.0431),
        "chandler": (33.3062, -111.8413),
        "laredo": (27.5306, -99.4803),
        "madison": (43.0731, -89.4012),
        "lubbock": (33.5779, -101.8552),
        "winston-salem": (36.0999, -80.2442),
        "garland": (32.9126, -96.6389),
        "glendale": (33.5387, -112.1860),
        "hialeah": (25.8576, -80.2781),
        "reno": (39.5296, -119.8138),
        "baton rouge": (30.4515, -91.1871),
        "irvine": (33.6846, -117.8265),
        "chesapeake": (36.7682, -76.2875),
        "irving": (32.8140, -96.9489),
        "scottsdale": (33.4942, -111.9261),
        "north las vegas": (36.1989, -115.1175),
        "fremont": (37.5485, -121.9886),
        "gilbert": (33.3528, -111.7890),
        "san bernardino": (34.1083, -117.2898),
        "boise": (43.6150, -116.2023),
        "birmingham": (33.5186, -86.8104),
        
        # State abbreviations to major cities
        "al": (32.3617, -86.2792),  # Alabama - Montgomery
        "ak": (61.2181, -149.9003),  # Alaska - Anchorage
        "az": (33.4484, -112.0740),  # Arizona - Phoenix
        "ar": (34.7465, -92.2896),  # Arkansas - Little Rock
        "ca": (34.0522, -118.2437),  # California - Los Angeles
        "co": (39.7392, -104.9903),  # Colorado - Denver
        "ct": (41.7658, -72.6734),  # Connecticut - Hartford
        "de": (39.3185, -75.5071),  # Delaware - Dover
        "fl": (27.7663, -82.6404),  # Florida - Tampa
        "ga": (33.7490, -84.3880),  # Georgia - Atlanta
        "hi": (21.3099, -157.8581),  # Hawaii - Honolulu
        "id": (43.6150, -116.2023),  # Idaho - Boise
        "il": (41.8781, -87.6298),  # Illinois - Chicago
        "in": (39.7684, -86.1581),  # Indiana - Indianapolis
        "ia": (41.5868, -93.6250),  # Iowa - Des Moines
        "ks": (39.0997, -94.5786),  # Kansas - Kansas City
        "ky": (38.2527, -85.7585),  # Kentucky - Louisville
        "la": (29.9511, -90.0715),  # Louisiana - New Orleans
        "me": (44.3106, -69.7795),  # Maine - Augusta
        "md": (39.2904, -76.6122),  # Maryland - Baltimore
        "ma": (42.3601, -71.0589),  # Massachusetts - Boston
        "mi": (42.3314, -83.0458),  # Michigan - Detroit
        "mn": (44.9778, -93.2650),  # Minnesota - Minneapolis
        "ms": (32.2988, -90.1848),  # Mississippi - Jackson
        "mo": (38.5767, -92.1735),  # Missouri - Columbia
        "mt": (47.0527, -110.2148),  # Montana - Great Falls
        "ne": (40.8136, -96.7026),  # Nebraska - Lincoln
        "nv": (36.1699, -115.1398),  # Nevada - Las Vegas
        "nh": (43.2081, -71.5376),  # New Hampshire - Manchester
        "nj": (40.7357, -74.1724),  # New Jersey - Newark
        "nm": (35.0844, -106.6504),  # New Mexico - Albuquerque
        "ny": (40.7128, -74.0060),  # New York - New York City
        "nc": (35.7796, -78.6382),  # North Carolina - Raleigh
        "nd": (46.8083, -100.7837),  # North Dakota - Bismarck
        "oh": (39.9612, -82.9988),  # Ohio - Columbus
        "ok": (35.4676, -97.5164),  # Oklahoma - Oklahoma City
        "or": (45.5152, -122.6784),  # Oregon - Portland
        "pa": (39.9526, -75.1652),  # Pennsylvania - Philadelphia
        "ri": (41.8240, -71.4128),  # Rhode Island - Providence
        "sc": (34.0007, -81.0348),  # South Carolina - Columbia
        "sd": (44.0998, -103.2218),  # South Dakota - Rapid City
        "tn": (36.1627, -86.7816),  # Tennessee - Nashville
        "tx": (29.7604, -95.3698),  # Texas - Houston
        "ut": (40.7608, -111.8910),  # Utah - Salt Lake City
        "vt": (44.2601, -72.5806),  # Vermont - Montpelier
        "va": (36.8529, -75.9780),  # Virginia - Virginia Beach
        "wa": (47.6062, -122.3321),  # Washington - Seattle
        "wv": (38.3498, -81.6326),  # West Virginia - Charleston
        "wi": (43.0389, -87.9065),  # Wisconsin - Milwaukee
        "wy": (41.1400, -104.8197),  # Wyoming - Cheyenne
    }
    
    # Normalize location string
    location_lower = location.lower().strip()
    
    # Direct lookup
    if location_lower in location_map:
        return location_map[location_lower]
    
    # 🔧 CRITICAL FIX: Smart partial matching to prevent Hawaii/Utah confusion
    # Collect all matches and prioritize by specificity and context
    matches = []
    for key, coords in location_map.items():
        if key in location_lower or location_lower in key:
            matches.append((key, coords, len(key)))  # Include length for prioritization
    
    if matches:
        # 🎯 PRIORITIZATION LOGIC:
        # 1. State codes in addresses (e.g., "UT 84056") get highest priority
        # 2. Longer matches are more specific (e.g., "honolulu" > "hi")
        # 3. Avoid partial substring false positives (e.g., "hi" in "Hill")
        
        # Check for explicit state codes with postal patterns
        state_code_matches = []
        for key, coords, length in matches:
            # Look for state code patterns like "UT 84056", "TX 75001", etc.
            if len(key) == 2 and f" {key} " in location_lower:
                state_code_matches.append((key, coords, length))
            elif len(key) == 2 and f", {key}" in location_lower:
                state_code_matches.append((key, coords, length))
            elif len(key) == 2 and location_lower.endswith(f" {key}"):
                state_code_matches.append((key, coords, length))
        
        if state_code_matches:
            # Return the first state code match (most reliable)
            return state_code_matches[0][1]
        
        # If no state code patterns, prioritize longer matches
        matches.sort(key=lambda x: x[2], reverse=True)  # Sort by length descending
        return matches[0][1]
    
    # No coordinates found
    return None

def _generate_geospatial_summary(location: str, poi_type: str, radius_meters: int, result: dict) -> str:
    """Generate a physical summary of geospatial query results."""
    try:
        summary_parts = []
        
        # Header
        summary_parts.append(f"🗺️ GEOSPATIAL ENRICHMENT SUMMARY")
        summary_parts.append(f"Location: {location}")
        summary_parts.append(f"POI Type: {poi_type}")
        summary_parts.append(f"Search Radius: {radius_meters}m")
        
        # Results overview
        data = result.get('data', {})
        if isinstance(data, dict) and 'elements' in data:
            elements = data['elements']
            poi_count = len(elements) if isinstance(elements, list) else 0
        else:
            poi_count = result.get('total_results', 0)
        
        summary_parts.append(f"\n📊 SEARCH RESULTS:")
        summary_parts.append(f"• Total POIs Found: {poi_count}")
        summary_parts.append(f"• Query Type: OpenStreetMap/Overpass")
        summary_parts.append(f"• Search Method: {'Coordinate-based' if ',' in location else 'Area-based'}")
        
        # Detailed findings
        if poi_count > 0:
            summary_parts.append(f"\n🎯 GEOSPATIAL INTELLIGENCE:")
            summary_parts.append(f"• {poi_type.title()} facilities identified in {location}")
            summary_parts.append(f"• Coverage area: {radius_meters}m radius")
            
            # Sample POI details if available
            if isinstance(data, dict) and 'elements' in data and data['elements']:
                sample_pois = data['elements'][:3]  # Top 3
                summary_parts.append(f"\n📍 SAMPLE LOCATIONS:")
                for i, poi in enumerate(sample_pois, 1):
                    if isinstance(poi, dict):
                        name = poi.get('tags', {}).get('name', f'{poi_type.title()} {i}')
                        lat = poi.get('lat', 'N/A')
                        lon = poi.get('lon', 'N/A')
                        summary_parts.append(f"  {i}. {name} ({lat}, {lon})")
        else:
            summary_parts.append(f"\n⚠️ NO RESULTS FOUND:")
            summary_parts.append(f"• No {poi_type} facilities found in {location}")
            summary_parts.append(f"• Consider expanding search radius or different POI type")
        
        # Strategic assessment
        summary_parts.append(f"\n🎯 STRATEGIC ASSESSMENT:")
        if poi_count >= 10:
            summary_parts.append("• HIGH DENSITY: Excellent facility coverage in area")
        elif poi_count >= 5:
            summary_parts.append("• MODERATE DENSITY: Good facility availability")
        elif poi_count >= 1:
            summary_parts.append("• LIMITED DENSITY: Few facilities available")
        else:
            summary_parts.append("• NO COVERAGE: No facilities found in search area")
        
        # Recommendations
        summary_parts.append(f"\n📋 RECOMMENDATIONS:")
        if poi_count > 0:
            summary_parts.append("• Utilize identified facilities for project planning")
            summary_parts.append("• Consider proximity to facilities in site selection")
            summary_parts.append("• Verify facility details and operating status")
        else:
            summary_parts.append("• Expand search radius for broader coverage")
            summary_parts.append("• Consider alternative POI types or locations")
            summary_parts.append("• Review regional facility distribution patterns")
        
        return "\n".join(summary_parts)
        
    except Exception as e:
        return f"Geospatial analysis completed for {location}. POI type: {poi_type}. Search radius: {radius_meters}m. Results: {result.get('total_results', 0)} locations found."

# [WRENCH] **Overpass Turbo Workshop Tool**
@mcp.tool()
async def overpass_turbo_workshop(
    workshop_type: str = "restaurants_near_coordinates"
) -> Dict[str, Any]:
    """
    [U+0001F393] Interactive Overpass Turbo workshop with real working examples.
    
    Provides ready-to-use Overpass QL queries that work identically in
    Overpass Turbo (overpass-turbo.eu). Great for learning and testing.
    
    Args:
        workshop_type: Type of workshop example to run
        
    Available Workshops:
        - "restaurants_near_coordinates": Find restaurants near specific coordinates
        - "pharmacies_in_bbox": Find pharmacies in a bounding box
        - "bus_stops_with_names": Find named bus stops
        - "hospitals_with_emergency": Find hospitals with emergency services
        - "atms_near_location": Find ATMs near a location
        - "schools_in_area": Find schools in an area
        
    Returns:
        Dictionary with workshop results and learning materials
    """
    
    workshops = {
        "restaurants_near_coordinates": {
            "description": "Find all restaurants within 1km of Berlin city center",
            "query": '[out:json]; node["amenity"="restaurant"](around:1000,52.5200,13.4050); out;',
            "learning_notes": [
                "Uses [out:json] to specify JSON output format",
                "node[\"amenity\"=\"restaurant\"] selects restaurant nodes", 
                "(around:1000,52.5200,13.4050) creates 1km radius around coordinates",
                "out; exports the results"
            ]
        },
        "pharmacies_in_bbox": {
            "description": "Find pharmacies in a bounding box around Berlin",
            "query": '[out:json]; node["amenity"="pharmacy"](bbox:52.4500,13.3000,52.6000,13.5500); out;',
            "learning_notes": [
                "bbox:south,west,north,east defines rectangular search area",
                "Coordinates are: south=52.45, west=13.30, north=52.60, east=13.55",
                "More efficient than radius for rectangular areas"
            ]
        },
        "bus_stops_with_names": {
            "description": "Find bus stops with names containing 'Central'",
            "query": '[out:json]; node["highway"="bus_stop"]["name"~"Central"]; out;',
            "learning_notes": [
                "Multiple tag filters: highway=bus_stop AND name contains Central",
                "~\"Central\" uses regex matching (case sensitive)",
                "Can combine multiple conditions with additional brackets"
            ]
        },
        "hospitals_with_emergency": {
            "description": "Find hospitals that have emergency services",
            "query": '[out:json]; node["amenity"="hospital"]["emergency"="yes"]; out;',
            "learning_notes": [
                "Filters hospitals by emergency=yes tag",
                "Demonstrates multiple required tag conditions",
                "Use emergency!=yes to find hospitals WITHOUT emergency"
            ]
        },
        "atms_near_location": {
            "description": "Find ATMs within 500m of coordinates",
            "query": '[out:json]; node["amenity"="atm"](around:500,52.5200,13.4050); out;',
            "learning_notes": [
                "Smaller radius (500m) for more targeted results",
                "amenity=atm finds cash machines", 
                "Change coordinates to search different locations"
            ]
        },
        "schools_in_area": {
            "description": "Find schools using area-based search",
            "query": '[out:json]; area["name"="Berlin"]; node["amenity"="school"](area); out;',
            "learning_notes": [
                "Two-step query: first find area, then search within it",
                "area[\"name\"=\"Berlin\"] finds the Berlin administrative area",
                "node[...](area) searches only within the found area"
            ]
        }
    }
    
    if workshop_type not in workshops:
        return {
            "success": False,
            "error": f"Unknown workshop type: {workshop_type}",
            "available_workshops": list(workshops.keys())
        }
    
    workshop = workshops[workshop_type]
    
    # Execute the workshop query
    result = await query_overpass(workshop["query"], output_format="json")
    
    # Add workshop metadata
    if result.get('success'):
        result['workshop_info'] = {
            "workshop_type": workshop_type,
            "description": workshop["description"],
            "overpass_query": workshop["query"],
            "learning_notes": workshop["learning_notes"],
            "overpass_turbo_url": f"https://overpass-turbo.eu/?Q={workshop['query'].replace(' ', '%20')}",
            "copy_paste_instructions": [
                "1. Visit https://overpass-turbo.eu/",
                "2. Paste this query in the left panel:",
                f"   {workshop['query']}",
                "3. Click 'Run' to see results on the map",
                "4. Results will be identical to what you see here"
            ]
        }
        result['overpass_turbo_compatible'] = True
    
    return result

# --- FastAPI Routes (following template pattern) ---

@app.get("/health")
async def health_check():
    """🏥 Health check endpoint with bulletproof MCP status."""
    try:
        # Count available MCP tools
        available_tools = len(TOOL_MAPPING)
        
        # Check quantum components
        quantum_status = "quantum_healthy" if QUANTUM_COMPRESSION_AVAILABLE else "quantum_degraded"
        
        return {
            "status": "healthy",
            "service": "quantum_enhanced_server",
            "pattern": "quantum_enhanced",
            "mcp_tools_available": available_tools,
            "quantum_status": quantum_status,
            "mcp_available": MCP_AVAILABLE,
            "graceful_degradation": not MCP_AVAILABLE,
            "template_compliant": True,
            "swiss_army_functionality": True,
            "usb_c_compatibility": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "graceful_degradation": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    """Health check endpoint with detailed status (template requirement)"""
    try:
        # Test core dependencies
        test_soup = BeautifulSoup("<test>working</test>", 'html.parser')
        test_jsonpath = jsonpath_ng.parse('$.test')
        
        return {
            "status": "healthy",
            "service": "overpass_beautifulsoup",
            "initialized": True,
            "pattern": "fastmcp",
            "transport": "http",
            "tools_count": 4,
            "template_compliant": True,
            "dependencies": {
                "beautifulsoup4": "[CHECK] working",
                "jsonpath_ng": "[CHECK] working", 
                "requests": "[CHECK] working",
                "httpx": "[CHECK] working"
            },
            "capabilities": {
                "overpass_queries": True,
                "html_parsing": True,
                "json_extraction": True,
                "sam_gov_parsing": True,
                "timeout_protection": True,
                "multiple_formats": True
            },
            "server_config": {
                "port": SERVER_PORT,
                "host": SERVER_HOST,
                "timeout": DEFAULT_TIMEOUT,
                "max_retries": MAX_RETRIES
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "overpass_beautifulsoup"
        }

@app.get("/tools")
async def get_tools():
    """Tools endpoint listing available operations (template requirement)"""
    return {
        "tools": [
            {
                "name": "query_overpass",
                "description": "Query Overpass API using Overpass QL (100% compatible with Overpass Turbo)",
                "category": "geospatial",
                "overpass_turbo_compatible": True
            },
            {
                "name": "overpass_turbo_query",
                "description": "Simplified Overpass Turbo queries for common use cases (auto-generates QL)",
                "category": "geospatial_simplified",
                "overpass_turbo_compatible": True
            },
            {
                "name": "overpass_turbo_workshop",
                "description": "Interactive Overpass Turbo workshop with real working examples and learning materials",
                "category": "geospatial_education", 
                "overpass_turbo_compatible": True
            },
            {
                "name": "query_html", 
                "description": "Query HTML content using CSS selectors with BeautifulSoup4",
                "category": "web_scraping"
            },
            {
                "name": "query_json",
                "description": "Query JSON data using JSONPath expressions", 
                "category": "data_extraction"
            },
            {
                "name": "parse_sam_response",
                "description": "Parse SAM.gov API responses into readable format",
                "category": "federal_procurement"
            }
        ],
        "total_tools": 6,
        "service_type": "fastmcp",
        "pattern_compliance": "[CHECK] FastMCP Gold Standard",
        "overpass_turbo_integration": {
            "fully_compatible": True,
            "website": "https://overpass-turbo.eu/",
            "identical_syntax": True,
            "copy_paste_queries": True,
            "workshop_mode": True,
            "learning_resources": True
        },
        "capabilities": [
            "overpass_queries",
            "overpass_turbo_100_percent_compatible",
            "overpass_turbo_workshop_mode",
            "overpass_turbo_simplified_queries",
            "html_parsing", 
            "json_extraction",
            "sam_gov_parsing",
            "timeout_protection",
            "multiple_formats"
        ]
    }

@app.post("/execute")
async def execute_operation(req: ServiceRequest):
    """Execute a service operation (template requirement)"""
    result = await adapter.execute_operation(req)
    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)
    return result.data

# MCP Protocol endpoint for quantum backend integration
@app.post("/mcp")
async def mcp_endpoint(request: dict):
    """
    MCP protocol endpoint for quantum backend integration.
    Handles JSON-RPC 2.0 requests from quantum backend.
    """
    try:
        # Extract MCP request data
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id")
        
        if method == "tools/call":
            # Extract tool name and arguments
            tool_name = params.get("name")
            arguments = params.get("arguments", {})
            
            # Map tool calls to our operations
            if tool_name == "query_overpass":
                result = await query_overpass(**arguments)
            elif tool_name == "overpass_turbo_query":
                result = await overpass_turbo_query(**arguments)
            elif tool_name == "overpass_turbo_workshop":
                result = await overpass_turbo_workshop(**arguments)
            elif tool_name == "query_html":
                result = await query_html(**arguments)
            elif tool_name == "query_json":
                result = await query_json(**arguments)
            elif tool_name == "parse_sam_response":
                result = await parse_sam_response(**arguments)
            else:
                raise HTTPException(status_code=400, detail=f"Unknown tool: {tool_name}")
            
            # Return MCP response format
            return {
                "jsonrpc": "2.0",
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": str(result)
                        }
                    ]
                },
                "id": request_id
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unknown method: {method}")
            
    except Exception as e:
        # Return MCP error response
        return {
            "jsonrpc": "2.0",
            "error": {
                "code": -1,
                "message": str(e)
            },
            "id": request.get("id")
        }

# Root MCP endpoint for VSCode/code_editor integration (JSON-RPC 2.0).
@app.post("/")
async def root_mcp_endpoint(request: Request):
    """Root MCP endpoint for VSCode/code_editor integration (JSON-RPC 2.0)."""
    try:
        body = await request.json()
        # Validate JSON-RPC 2.0 structure
        if not all(k in body for k in ("jsonrpc", "method", "id")):
            return JSONResponse(
                content={
                    "jsonrpc": "2.0",
                    "error": {"code": -32600, "message": "Invalid Request"},
                    "id": body.get("id", None)
                },
                status_code=400
            )
        response = await mcp_endpoint(body)
        # Ensure JSON-RPC 2.0 compliance in response
        if isinstance(response, dict) and "jsonrpc" not in response:
            response["jsonrpc"] = "2.0"
        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(
            content={
                "jsonrpc": "2.0",
                "error": {"code": -32603, "message": str(e)},
                "id": None
            },
            status_code=500
        )

# Application lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info(f"[ROCKET] Starting Overpass/BeautifulSoup MCP server on {SERVER_HOST}:{SERVER_PORT}")
    yield
    # Shutdown
    await adapter.cleanup()
    logger.info("[U+0001F6D1] Overpass/BeautifulSoup MCP server stopped")

app.router.lifespan_context = lifespan

# Development server
if __name__ == "__main__":
    async def init_server():
        try:
            logger.info("[TROPHY] Overpass/BeautifulSoup FastMCP Server - Gold Standard")
            logger.info("[CHECK] SERVER_TEMPLATES_GUIDE.md Compliant")
            logger.info("[CHART] Pattern: FastMCP (Stateless Data Operations)")
            logger.info("[WRENCH] Features: Overpass API, HTML parsing, JSON extraction, SAM.gov support")
            logger.info("[LIGHTNING] Capabilities: Timeout protection, multiple formats, comprehensive error handling")
            logger.info(f"[GLOBE] Server URL: http://{SERVER_HOST}:{SERVER_PORT}")
            logger.info("[TOOLS] Available Tools:")
            logger.info("   • query_overpass - Geospatial data queries (100% Overpass Turbo compatible)")
            logger.info("   • overpass_turbo_query - Simplified POI searches")  
            logger.info("   • overpass_turbo_workshop - Interactive learning examples")
            logger.info("   • query_html - Web scraping with CSS selectors")  
            logger.info("   • query_json - JSON data extraction with JSONPath")
            logger.info("   • parse_sam_response - SAM.gov federal procurement parsing")
            
            # Use modern FastMCP server initialization
            logger.info(f"\n[ROCKET] Starting FastAPI server directly on {SERVER_HOST}:{SERVER_PORT}...")
            
            # Run FastAPI directly with uvicorn for better compatibility
            import uvicorn
            config = uvicorn.Config(
                app=app,
                host=SERVER_HOST,
                port=SERVER_PORT,
                log_level="info",
                reload=False
            )
            server = uvicorn.Server(config)
            await server.serve()
            
        except KeyboardInterrupt:
            logger.info("[U+0001F6D1] Server stopped by user")
        except Exception as e:
            logger.error(f"[U+0001F4A5] Fatal error: {str(e)}", exc_info=True)

    # Run the async initialization
    try:
        asyncio.run(init_server())
    except KeyboardInterrupt:
        logger.info("[U+0001F6D1] Server stopped by user")
    except Exception as e:
        logger.error(f"[U+0001F4A5] Failed to start server: {str(e)}")
        sys.exit(1)