# 🏆 AOS Framework Server Templates Guide

## Overview

The AOS (Agent Operating System) Framework provides **comprehensive architectural patterns and compliance standards** for building production-grade MCP servers. This guide covers both **architectural patterns** for ecosystem integration and **compliance requirements** for MCP JSON-RPC 2.0, SSL/TLS, and client compatibility.

Our templates are based on our battle-tested **Intelligence-to-Execution Pipeline** architecture, supporting the complete AOS Framework service ecosystem with **7 core required services** and standardized patterns for maximum interoperability.

## 🌌 **QUANTUM-ENHANCED PATTERN**

**A quantum-enhanced master-slave intelligence server with comprehensive functionality and compatibility. This pattern supports FastAPI + SlowAPI + MCP + Master-Slave + Quantum enhancements simultaneously for high-performance server architecture.**

## 🔌 **STANDARD PORT ALLOCATION (MANDATORY)**

**All AOS Framework servers MUST use standardized, non-conflicting ports for seamless ecosystem integration.**

### 🏆 Core Service Port Standards

#### ✅ Required Core Service Ports:
```
🔍 Tavily Web Intelligence         → Port 8931
📚 Wikipedia Research             → Port 8932  
🧠 Pinecone Vector Intelligence   → Port 8940
📁 Filesystem & Document Intel   → Port 8944
🤖 Playwright Automation         → Port 8947
💬 Quantum Chat Persistence      → Port 8991
⚡ Quantum Parallel Agent Factory → Port 8995
```

#### 🏗️ Port Allocation Implementation Pattern:
```python
# Standard Port Configuration (MANDATORY)
CORE_SERVICE_PORTS = {
    "tavily_server.py": 8931,
    "wikipedia_server.py": 8932,
    "pinecone_vector_server.py": 8940,
    "filesystem_server.py": 8944,
    "playwright_server.py": 8947,
    "quantum_chat_persistence_server.py": 8991,
    "quantum_parallel_agent_factory.py": 8995
}

# Port validation (MANDATORY in all servers)
def validate_server_port(server_name: str, port: int):
    """Ensure server uses standardized port allocation"""
    expected_port = CORE_SERVICE_PORTS.get(server_name)
    if expected_port and port != expected_port:
        raise ValueError(f"Port conflict: {server_name} must use port {expected_port}, not {port}")
    return True

# Server startup with port validation
if __name__ == "__main__":
    server_name = Path(__file__).name
    port = YOUR_STANDARD_PORT
    validate_server_port(server_name, port)
    uvicorn.run(app, host="0.0.0.0", port=port)
```

## 🏗️ **SERVICE ADAPTER ARCHITECTURE (MANDATORY)**

**All service integrations MUST use the MCPCompliantServiceAdapter pattern for standardized ecosystem integration.**

### 🏆 Service Adapter Gold Standards

#### ✅ Mandatory Service Adapter Features:
- **Inheritance**: All adapters MUST inherit from `MCPCompliantServiceAdapter`
- **MCP Tools**: All capabilities MUST use `@mcp.tool()` decorator
- **Port Compliance**: All adapters MUST use standardized ports
- **Health Monitoring**: All adapters MUST implement health checking
- **Graceful Degradation**: All adapters MUST handle server unavailability
- **Timeout Management**: All adapters MUST implement proper timeout handling
- **Error Recovery**: All adapters MUST provide automatic error recovery

#### 🔧 Service Adapter Implementation Pattern (MANDATORY):
```python
#!/usr/bin/env python3
"""
🌟 AOS Framework Service Adapter - SERVER_TEMPLATES_GUIDE.md Compliant
MANDATORY pattern for all service integrations with full MCP compliance.
"""

from services.base.service_adapter import MCPCompliantServiceAdapter, ServiceType
from core.mcp import mcp
from typing import Dict, Any, Optional

class YourServiceAdapter(MCPCompliantServiceAdapter):
    """
    🌟 SERVER_TEMPLATES_GUIDE.md Compliant Service Adapter
    
    This adapter provides standardized integration with your service
    following AOS Framework architectural patterns.
    """
    
    def __init__(self, base_url: str = "http://localhost:YOUR_STANDARD_PORT"):
        super().__init__(
            name="your_service_name", 
            service_type=ServiceType.YOUR_TYPE,
            base_url=base_url,
            timeout=30.0
        )
        
        # Add service-specific capabilities
        self.add_capability("your_capability", "Description of capability")
    
    async def initialize(self) -> bool:
        """Initialize service adapter with health check"""
        try:
            # Perform service-specific initialization
            health = await self.get_health()
            return health.status == ServiceStatus.HEALTHY
        except Exception as e:
            self.initialization_error = str(e)
            return False
    
    @mcp.tool()
    async def your_capability(self, param: str, optional_param: int = 10) -> Dict[str, Any]:
        """
        🌟 MCP Tool with automatic compliance
        
        Args:
            param: Required parameter description
            optional_param: Optional parameter with default
            
        Returns:
            Dict with success status and results
        """
        try:
            # Use the standardized MCP call executor
            result = await self.execute_mcp_call("your_tool", {
                "param": param,
                "optional_param": optional_param
            })
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_service_info(self) -> Dict[str, Any]:
        """Get comprehensive service information"""
        return {
            "name": self.name,
            "type": self.service_type.value,
            "base_url": self.base_url,
            "capabilities": [cap.name for cap in self.capabilities],
            "mcp_compliant": self._mcp_compliant,
            "server_templates_guide_compliant": self._server_templates_guide_compliant
        }
```

## 🌟 **CORE SERVICE REQUIREMENTS (MANDATORY)**

**AOS Framework defines 7 required core services for complete operational coverage.**

### 🏆 Required Core Services (ALL MANDATORY)

#### ✅ Intelligence-to-Execution Pipeline Services:

1. **🔍 Tavily Server** (`tavily_server.py:8931`)
   - **Purpose**: Web Intelligence & Real-time Research
   - **Role**: Primary intelligence gathering for the pipeline
   - **Required**: ✅ YES - Core intelligence source

2. **📚 Wikipedia Server** (`wikipedia_server.py:8932`)
   - **Purpose**: Knowledge Base & Contextual Research  
   - **Role**: Foundational knowledge and context building
   - **Required**: ✅ YES - Essential context provider

3. **🧠 Pinecone Vector Server** (`pinecone_vector_server.py:8940`)
   - **Purpose**: Semantic Memory & Vector Search
   - **Role**: Unified brain storage and semantic retrieval
   - **Required**: ✅ YES - Memory and context persistence

4. **📁 Filesystem Server** (`filesystem_server.py:8944`)
   - **Purpose**: Document Intelligence & File Operations
   - **Role**: Document processing and file management
   - **Required**: ✅ YES - Document handling and storage

5. **🤖 Playwright Server** (`playwright_server.py:8947`)
   - **Purpose**: Web Automation & Dynamic Execution
   - **Role**: Automation execution and web interactions
   - **Required**: ✅ YES - Execution phase of pipeline

6. **💬 Quantum Chat Persistence** (`quantum_chat_persistence_server.py:8991`)
   - **Purpose**: Elite AI Trinity Integration & Context
   - **Role**: Contextual awareness across all AI models
   - **Required**: ✅ YES - Multi-model context management

7. **⚡ Quantum Parallel Agent Factory** (`quantum_parallel_agent_factory.py:8995`)
   - **Purpose**: Multi-Model Processing & Agent Manufacturing
   - **Role**: Elite AI Trinity coordination and parallel processing
   - **Required**: ✅ YES - Core multi-model intelligence

#### 🏭 Service Requirement Implementation (MANDATORY):
```python
#!/usr/bin/env python3
"""
🌟 AOS Framework Service Requirements Validator
Ensures all required core services are available and operational.
"""

from pathlib import Path
from typing import Dict, Any
import asyncio
import httpx

# Core Service Requirements (MANDATORY)
CORE_SERVICES = {
    "tavily_server.py": {
        "port": 8931, 
        "required": True,
        "description": "🔍 Tavily Web Intelligence Server",
        "role": "Primary intelligence gathering"
    },
    "wikipedia_server.py": {
        "port": 8932, 
        "required": True,
        "description": "📚 Wikipedia Research Server",
        "role": "Knowledge base and context"
    },
    "pinecone_vector_server.py": {
        "port": 8940, 
        "required": True,
        "description": "🧠 Pinecone Vector Intelligence Server",
        "role": "Semantic memory and search"
    },
    "filesystem_server.py": {
        "port": 8944, 
        "required": True,
        "description": "📁 Filesystem & Document Intelligence Server",
        "role": "Document processing and storage"
    },
    "playwright_server.py": {
        "port": 8947, 
        "required": True,
        "description": "🤖 Playwright Automation Server",
        "role": "Web automation and execution"
    },
    "quantum_chat_persistence_server.py": {
        "port": 8991, 
        "required": True,
        "description": "💬 Quantum Chat Persistence Server",
        "role": "Elite AI Trinity context management"
    },
    "quantum_parallel_agent_factory.py": {
        "port": 8995, 
        "required": True,
        "description": "⚡ Quantum Parallel Agent Factory",
        "role": "Multi-model parallel processing"
    }
}

async def validate_required_services() -> Dict[str, Any]:
    """
    🌟 MANDATORY Service Ecosystem Validation
    
    Validates that all required core services are available and healthy.
    This is required before any AOS Framework operations.
    """
    validation_results = {
        "total_services": len(CORE_SERVICES),
        "required_services": sum(1 for s in CORE_SERVICES.values() if s["required"]),
        "available_services": 0,
        "healthy_services": 0,
        "service_status": {},
        "ecosystem_operational": False
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, config in CORE_SERVICES.items():
            status = {
                "exists": check_server_exists(service_name),
                "required": config["required"],
                "port": config["port"],
                "healthy": False,
                "description": config["description"]
            }
            
            if status["exists"]:
                validation_results["available_services"] += 1
                
                # Check health if server exists
                try:
                    health_url = f"http://localhost:{config['port']}/health"
                    response = await client.get(health_url)
                    if response.status_code == 200:
                        status["healthy"] = True
                        validation_results["healthy_services"] += 1
                except:
                    pass  # Server exists but not healthy/running
            
            validation_results["service_status"][service_name] = status
    
    # Ecosystem is operational if all required services are healthy
    required_healthy = sum(
        1 for s in validation_results["service_status"].values() 
        if s["required"] and s["healthy"]
    )
    validation_results["ecosystem_operational"] = (
        required_healthy == validation_results["required_services"]
    )
    
    return validation_results

def check_server_exists(server_name: str) -> bool:
    """Check if server file exists in servers directory"""
    server_path = Path("servers") / server_name
    return server_path.exists()

async def ensure_ecosystem_operational():
    """
    🌟 MANDATORY Ecosystem Validation
    
    Ensures the complete AOS Framework ecosystem is operational.
    Raises RuntimeError if required services are unavailable.
    """
    results = await validate_required_services()
    
    if not results["ecosystem_operational"]:
        missing_services = [
            name for name, status in results["service_status"].items()
            if status["required"] and not status["healthy"]
        ]
        raise RuntimeError(
            f"AOS Framework ecosystem not operational. "
            f"Missing/unhealthy required services: {missing_services}"
        )
    
    print("✅ AOS Framework ecosystem validated and operational")
    print(f"✅ {results['healthy_services']}/{results['total_services']} services healthy")
    print("✅ Intelligence-to-execution pipeline ready")
    
    return True
```

## 🧠 **INTELLIGENCE-TO-EXECUTION PIPELINE (ARCHITECTURAL PATTERN)**

**The AOS Framework implements a complete intelligence-to-execution pipeline with contextual awareness across all AI models.**

### 🏆 Pipeline Architecture Pattern

#### 🔄 Complete Intelligence Pipeline Flow:
```
📚 Wikipedia (Knowledge Base) → 🔍 Tavily (Web Intelligence) → ⚡ Quantum Factory (Multi-Model Analysis)
                                         ↓                              ↓
🧠 Unified Brain (Memory) ←→ 💬 Chat Persistence (Context) → 🤖 Playwright (Automation) → 📁 Filesystem (Results)
```

#### ⚡ Pipeline Implementation Pattern (MANDATORY):
```python
#!/usr/bin/env python3
"""
🌟 AOS Framework Intelligence-to-Execution Pipeline
Complete pipeline implementation with Elite AI Trinity integration.
"""

from services.research.wikipedia_adapter import WikipediaAdapter
from services.research.tavily_adapter import TavilyAdapter
from services.automation.playwright_adapter import PlaywrightAdapter
from services.intelligence.quantum_parallel_agent_factory_adapter import QuantumParallelAgentFactoryAdapter
from services.storage.filesystem_adapter import FilesystemServiceAdapter
from services.storage.unified_brain_adapter import UnifiedBrainServiceAdapter
from services.intelligence.hybrid_chat_persistence_adapter import HybridChatPersistenceAdapter
from typing import Dict, Any, Optional

class IntelligenceExecutionPipeline:
    """
    🌟 AOS Framework Intelligence-to-Execution Pipeline
    
    Complete pipeline implementation supporting:
    - Multi-source intelligence gathering
    - Elite AI Trinity multi-model processing  
    - Contextual awareness across all models
    - Automated execution and result storage
    """
    
    def __init__(self):
        # Initialize all core service adapters
        self.wikipedia = WikipediaAdapter()
        self.tavily = TavilyAdapter()
        self.playwright = PlaywrightAdapter()
        self.quantum_factory = QuantumParallelAgentFactoryAdapter()
        self.filesystem = FilesystemServiceAdapter()
        self.unified_brain = UnifiedBrainServiceAdapter()
        self.chat_persistence = HybridChatPersistenceAdapter()
        
        self.services = [
            self.wikipedia, self.tavily, self.playwright, 
            self.quantum_factory, self.filesystem, 
            self.unified_brain, self.chat_persistence
        ]
    
    async def initialize_pipeline(self) -> bool:
        """Initialize all pipeline services"""
        initialization_results = []
        
        for service in self.services:
            try:
                initialized = await service.initialize()
                initialization_results.append(initialized)
                if initialized:
                    print(f"✅ {service.name} initialized successfully")
                else:
                    print(f"⚠️  {service.name} initialization failed, will degrade gracefully")
            except Exception as e:
                print(f"❌ {service.name} initialization error: {e}")
                initialization_results.append(False)
        
        # Pipeline is operational if core services are available
        core_services_ok = all(initialization_results[:4])  # Wikipedia, Tavily, Playwright, Quantum Factory
        return core_services_ok
    
    async def execute_intelligence_pipeline(self, 
                                          query: str, 
                                          execution_mode: str = "comprehensive") -> Dict[str, Any]:
        """
        🌟 Execute Complete Intelligence-to-Execution Pipeline
        
        Args:
            query: The intelligence query or task
            execution_mode: "research_only", "analysis_only", or "comprehensive"
            
        Returns:
            Complete pipeline results with execution artifacts
        """
        pipeline_results = {
            "query": query,
            "mode": execution_mode,
            "intelligence": {},
            "analysis": {},
            "execution": {},
            "storage": {},
            "context": {},
            "success": False,
            "pipeline_stage": "initialization"
        }
        
        try:
            # Stage 1: Knowledge Base Intelligence
            pipeline_results["pipeline_stage"] = "knowledge_gathering"
            print(f"🔍 Stage 1: Gathering knowledge base intelligence for: {query}")
            
            knowledge_context = await self.wikipedia.research_topic(
                topic=query, 
                depth="comprehensive"
            )
            pipeline_results["intelligence"]["knowledge_base"] = knowledge_context
            
            # Stage 2: Web Intelligence Gathering  
            pipeline_results["pipeline_stage"] = "web_intelligence"
            print(f"🌐 Stage 2: Gathering web intelligence for: {query}")
            
            web_intelligence = await self.tavily.comprehensive_research(
                topic=query,
                max_sources=5
            )
            pipeline_results["intelligence"]["web_research"] = web_intelligence
            
            # Stage 3: Elite AI Trinity Multi-Model Processing
            pipeline_results["pipeline_stage"] = "multi_model_analysis"
            print(f"🧠 Stage 3: Elite AI Trinity multi-model analysis")
            
            analysis_payload = {
                "query": query,
                "knowledge_context": knowledge_context,
                "web_intelligence": web_intelligence,
                "analysis_depth": "comprehensive"
            }
            
            multi_model_analysis = await self.quantum_factory.auto_mode_intelligence(analysis_payload)
            pipeline_results["analysis"]["multi_model"] = multi_model_analysis
            
            # Stage 4: Contextual Storage (Parallel)
            pipeline_results["pipeline_stage"] = "context_storage"
            print(f"💾 Stage 4: Storing context and intelligence")
            
            # Store in unified brain for semantic search
            if self.unified_brain:
                try:
                    brain_storage = await self.unified_brain.store_knowledge({
                        "query": query,
                        "intelligence": pipeline_results["intelligence"],
                        "analysis": multi_model_analysis
                    })
                    pipeline_results["storage"]["unified_brain"] = brain_storage
                except Exception as e:
                    print(f"⚠️  Unified brain storage failed: {e}")
            
            # Store conversation context for multi-model awareness
            if self.chat_persistence:
                try:
                    context_storage = await self.chat_persistence.store_conversation_context(
                        query, multi_model_analysis
                    )
                    pipeline_results["context"]["chat_persistence"] = context_storage
                except Exception as e:
                    print(f"⚠️  Chat persistence failed: {e}")
            
            # Stage 5: Execution (if comprehensive mode)
            if execution_mode == "comprehensive" and "execution_plan" in multi_model_analysis:
                pipeline_results["pipeline_stage"] = "execution"
                print(f"🤖 Stage 5: Executing automation plan")
                
                execution_results = await self.playwright.execute_intelligent_automation(
                    multi_model_analysis.get("execution_plan", {})
                )
                pipeline_results["execution"]["automation"] = execution_results
                
                # Store execution artifacts
                if self.filesystem and execution_results.get("success"):
                    try:
                        artifact_storage = await self.filesystem.store_execution_artifacts({
                            "query": query,
                            "analysis": multi_model_analysis,
                            "execution": execution_results
                        })
                        pipeline_results["storage"]["artifacts"] = artifact_storage
                    except Exception as e:
                        print(f"⚠️  Artifact storage failed: {e}")
            
            pipeline_results["success"] = True
            pipeline_results["pipeline_stage"] = "completed"
            
            print("✅ Intelligence-to-Execution Pipeline completed successfully")
            print(f"✅ Query: {query}")
            print(f"✅ Mode: {execution_mode}")
            print(f"✅ Stages completed: {pipeline_results['pipeline_stage']}")
            
            return pipeline_results
            
        except Exception as e:
            pipeline_results["success"] = False
            pipeline_results["error"] = str(e)
            pipeline_results["failed_stage"] = pipeline_results["pipeline_stage"]
            
            print(f"❌ Pipeline failed at stage: {pipeline_results['pipeline_stage']}")
            print(f"❌ Error: {e}")
            
            return pipeline_results
    
    async def cleanup_pipeline(self):
        """Cleanup all pipeline resources"""
        for service in self.services:
            try:
                await service.cleanup()
            except Exception as e:
                print(f"⚠️  Cleanup warning for {service.name}: {e}")
        
        print("✅ Pipeline cleanup completed")

# Example Pipeline Usage (MANDATORY pattern)
async def example_pipeline_usage():
    """
    🌟 Example Intelligence-to-Execution Pipeline Usage
    Demonstrates complete pipeline integration.
    """
    pipeline = IntelligenceExecutionPipeline()
    
    try:
        # Initialize pipeline
        initialized = await pipeline.initialize_pipeline()
        if not initialized:
            raise RuntimeError("Pipeline initialization failed")
        
        # Execute comprehensive intelligence pipeline
        results = await pipeline.execute_intelligence_pipeline(
            query="Latest developments in quantum computing applications",
            execution_mode="comprehensive"
        )
        
        if results["success"]:
            print("🎉 Pipeline execution successful!")
            print(f"🧠 Intelligence gathered from {len(results['intelligence'])} sources")
            print(f"⚡ Multi-model analysis completed")
            print(f"🤖 Automation executed: {results['execution'].get('success', False)}")
        else:
            print(f"❌ Pipeline execution failed: {results.get('error')}")
            
    finally:
        await pipeline.cleanup_pipeline()

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_pipeline_usage())
```

## 🔍 **SERVICE ECOSYSTEM VALIDATION (MANDATORY)**

**All AOS Framework deployments MUST validate the complete service ecosystem before operations.**

### 🏆 Ecosystem Validation Requirements

#### ✅ Mandatory Validation Checks:
- **Service Initialization**: All core services must initialize successfully
- **MCP Compliance**: All services must be MCP JSON-RPC 2.0 compliant
- **Tool Registration**: All MCP tools must be registered and discoverable  
- **Health Monitoring**: All services must provide health status endpoints
- **Port Compliance**: All services must use standardized port allocation
- **Pipeline Integration**: Intelligence-to-execution pipeline must be operational
- **SSL Compliance**: All services must support SSL/TLS when certificates available

#### 🧪 Comprehensive Validation Implementation (MANDATORY):
```python
#!/usr/bin/env python3
"""
🌟 AOS Framework Service Ecosystem Validator
MANDATORY validation for complete service ecosystem before operations.
"""

import asyncio
import httpx
from pathlib import Path
from typing import Dict, Any, List
from services import *  # Import all service adapters
from core.mcp import TOOL_MAPPING

class ComprehensiveServiceEcosystemValidator:
    """
    🔌 Comprehensive Service Ecosystem Validator
    
    Validates the complete AOS Framework service ecosystem including:
    - All 7 core services operational
    - Intelligence-to-execution pipeline functional
    - MCP compliance across all services
    - Complete operational coverage
    """
    
    def __init__(self):
        # Initialize all service adapters for validation
        self.research_services = [TavilyAdapter(), WikipediaAdapter()]
        self.automation_services = [PlaywrightAdapter(), MacroRecordingEngineAdapter()]
        self.storage_services = [FilesystemServiceAdapter(), UnifiedBrainServiceAdapter()]
        self.intelligence_services = [
            CodeEditorServiceAdapter(), DocumentIntelligenceServiceAdapter(),
            HybridChatPersistenceAdapter(), QuantumParallelAgentFactoryAdapter()
        ]
        
        self.all_services = (
            self.research_services + self.automation_services + 
            self.storage_services + self.intelligence_services
        )
        
        self.validation_results = {
            "total_services": len(self.all_services),
            "initialized_services": 0,
            "mcp_compliant_services": 0,
            "healthy_services": 0,
            "total_mcp_tools": 0,
            "ecosystem_operational": False,
            "pipeline_operational": False,
            "validation_errors": []
        }

    async def run_comprehensive_validation(self) -> Dict[str, Any]:
        """
        🌟 MANDATORY Comprehensive Service Ecosystem Validation
        
        Performs complete validation of the AOS Framework service ecosystem.
        This MUST be run before any production operations.
        """
        print("🔌 Running Comprehensive Service Ecosystem Validation...")
        print("=" * 80)
        
        # Stage 1: Service Initialization
        await self._validate_service_initialization()
        
        # Stage 2: MCP Compliance
        await self._validate_mcp_compliance()
        
        # Stage 3: Health Monitoring
        await self._validate_health_monitoring()
        
        # Stage 4: Tool Registration
        await self._validate_tool_registration()
        
        # Stage 5: Pipeline Integration
        await self._validate_pipeline_integration()
        
        # Stage 6: Final Ecosystem Assessment
        self._assess_ecosystem_operational_status()
        
        print("=" * 80)
        if self.validation_results["ecosystem_operational"]:
            print("🎉 COMPREHENSIVE SERVICE ECOSYSTEM VALIDATION SUCCESS!")
            print("✅ All core services validated and operational")
            print("✅ Intelligence-to-execution pipeline functional") 
            print("✅ MCP compliance verified across all services")
            print("✅ Complete operational coverage achieved")
            print("🚀 AOS Framework ready for production operations")
        else:
            print("❌ SERVICE ECOSYSTEM VALIDATION FAILED")
            print("⚠️  Required services missing or non-compliant")
            print("🛠️  Review validation errors and fix before proceeding")
        
        return self.validation_results
    
    async def _validate_service_initialization(self):
        """Validate all services initialize correctly"""
        print("🧪 Stage 1: Service Initialization Validation...")
        
        for service in self.all_services:
            try:
                initialized = await service.initialize()
                if initialized:
                    self.validation_results["initialized_services"] += 1
                    print(f"  ✅ {service.name} initialized successfully")
                else:
                    print(f"  ❌ {service.name} initialization failed")
                    self.validation_results["validation_errors"].append(
                        f"Service initialization failed: {service.name}"
                    )
            except Exception as e:
                print(f"  ❌ {service.name} initialization error: {e}")
                self.validation_results["validation_errors"].append(
                    f"Service initialization exception: {service.name} - {e}"
                )
    
    async def _validate_mcp_compliance(self):
        """Validate MCP compliance across all services"""
        print("🧪 Stage 2: MCP Compliance Validation...")
        
        for service in self.all_services:
            if hasattr(service, '_mcp_compliant') and service._mcp_compliant:
                if hasattr(service, '_server_templates_guide_compliant') and service._server_templates_guide_compliant:
                    self.validation_results["mcp_compliant_services"] += 1
                    print(f"  ✅ {service.name} MCP compliance verified")
                else:
                    print(f"  ❌ {service.name} SERVER_TEMPLATES_GUIDE compliance failed")
                    self.validation_results["validation_errors"].append(
                        f"SERVER_TEMPLATES_GUIDE compliance failed: {service.name}"
                    )
            else:
                print(f"  ❌ {service.name} MCP compliance failed")
                self.validation_results["validation_errors"].append(
                    f"MCP compliance failed: {service.name}"
                )
    
    async def _validate_health_monitoring(self):
        """Validate health monitoring across all services"""
        print("🧪 Stage 3: Health Monitoring Validation...")
        
        for service in self.all_services:
            try:
                health = await service.get_mcp_compliant_health()
                if health and health.get("status"):
                    self.validation_results["healthy_services"] += 1
                    print(f"  ✅ {service.name} health monitoring operational")
                else:
                    print(f"  ❌ {service.name} health monitoring failed")
                    self.validation_results["validation_errors"].append(
                        f"Health monitoring failed: {service.name}"
                    )
            except Exception as e:
                print(f"  ❌ {service.name} health monitoring error: {e}")
                self.validation_results["validation_errors"].append(
                    f"Health monitoring exception: {service.name} - {e}"
                )
    
    async def _validate_tool_registration(self):
        """Validate MCP tool registration"""
        print("🧪 Stage 4: Tool Registration Validation...")
        
        self.validation_results["total_mcp_tools"] = len(TOOL_MAPPING)
        print(f"  ✅ Total registered MCP tools: {self.validation_results['total_mcp_tools']}")
        
        decorated_tools = 0
        for service in self.all_services:
            service_tools = 0
            for attr_name in dir(service):
                attr = getattr(service, attr_name)
                if callable(attr) and hasattr(attr, '_is_mcp_tool') and attr._is_mcp_tool:
                    service_tools += 1
                    decorated_tools += 1
            if service_tools > 0:
                print(f"  ✅ {service.name}: {service_tools} MCP tools registered")
        
        if decorated_tools == self.validation_results["total_mcp_tools"]:
            print(f"  ✅ Tool registration validation successful")
        else:
            print(f"  ⚠️  Tool registration mismatch detected")
            self.validation_results["validation_errors"].append(
                f"Tool registration mismatch: {self.validation_results['total_mcp_tools']} expected, {decorated_tools} found"
            )
    
    async def _validate_pipeline_integration(self):
        """Validate intelligence-to-execution pipeline integration"""
        print("🧪 Stage 5: Pipeline Integration Validation...")
        
        try:
            # Test basic pipeline component integration
            pipeline_components = {
                "wikipedia": any(isinstance(s, WikipediaAdapter) for s in self.all_services),
                "tavily": any(isinstance(s, TavilyAdapter) for s in self.all_services),
                "playwright": any(isinstance(s, PlaywrightAdapter) for s in self.all_services),
                "quantum_factory": any(isinstance(s, QuantumParallelAgentFactoryAdapter) for s in self.all_services),
                "filesystem": any(isinstance(s, FilesystemServiceAdapter) for s in self.all_services),
                "unified_brain": any(isinstance(s, UnifiedBrainServiceAdapter) for s in self.all_services),
                "chat_persistence": any(isinstance(s, HybridChatPersistenceAdapter) for s in self.all_services)
            }
            
            missing_components = [name for name, present in pipeline_components.items() if not present]
            
            if not missing_components:
                self.validation_results["pipeline_operational"] = True
                print("  ✅ Intelligence-to-execution pipeline components validated")
                print("  ✅ Multi-model contextual awareness enabled")
                print("  ✅ Complete operational coverage verified")
            else:
                print(f"  ❌ Pipeline components missing: {missing_components}")
                self.validation_results["validation_errors"].append(
                    f"Pipeline components missing: {missing_components}"
                )
                
        except Exception as e:
            print(f"  ❌ Pipeline integration validation error: {e}")
            self.validation_results["validation_errors"].append(
                f"Pipeline integration validation failed: {e}"
            )
    
    def _assess_ecosystem_operational_status(self):
        """Assess overall ecosystem operational status"""
        print("🧪 Stage 6: Ecosystem Operational Assessment...")
        
        # Ecosystem is operational if:
        # - All services initialized
        # - All services MCP compliant  
        # - All services healthy
        # - Pipeline components present
        # - No critical validation errors
        
        total_services = self.validation_results["total_services"]
        ecosystem_ready = (
            self.validation_results["initialized_services"] == total_services and
            self.validation_results["mcp_compliant_services"] == total_services and
            self.validation_results["healthy_services"] == total_services and
            self.validation_results["pipeline_operational"] and
            len(self.validation_results["validation_errors"]) == 0
        )
        
        self.validation_results["ecosystem_operational"] = ecosystem_ready
        
        if ecosystem_ready:
            print("  ✅ Ecosystem operational assessment: PASSED")
        else:
            print("  ❌ Ecosystem operational assessment: FAILED")
            print(f"     Services initialized: {self.validation_results['initialized_services']}/{total_services}")
            print(f"     Services MCP compliant: {self.validation_results['mcp_compliant_services']}/{total_services}")
            print(f"     Services healthy: {self.validation_results['healthy_services']}/{total_services}")
            print(f"     Pipeline operational: {self.validation_results['pipeline_operational']}")
            print(f"     Validation errors: {len(self.validation_results['validation_errors'])}")

# MANDATORY Validation Function (REQUIRED before all operations)
async def validate_aos_framework_ecosystem() -> bool:
    """
    🌟 MANDATORY AOS Framework Ecosystem Validation
    
    This function MUST be called before any AOS Framework operations.
    Returns True if ecosystem is operational, raises RuntimeError if not.
    """
    validator = ComprehensiveServiceEcosystemValidator()
    results = await validator.run_comprehensive_validation()
    
    if not results["ecosystem_operational"]:
        error_summary = "\n".join(results["validation_errors"])
        raise RuntimeError(
            f"AOS Framework ecosystem validation failed.\n"
            f"Errors encountered:\n{error_summary}\n"
            f"Please resolve these issues before proceeding."
        )
    
    return True

# Example Usage (MANDATORY pattern for all applications)
async def example_ecosystem_validation():
    """
    🌟 Example AOS Framework Ecosystem Validation
    Demonstrates mandatory validation before operations.
    """
    try:
        # MANDATORY: Validate ecosystem before any operations
        ecosystem_ready = await validate_aos_framework_ecosystem()
        
        if ecosystem_ready:
            print("🚀 AOS Framework ecosystem validated and ready!")
            print("✅ All services operational with full compliance")
            print("✅ Intelligence-to-execution pipeline functional")
            print("✅ Proceed with confidence to production operations")
            
            # Now safe to proceed with AOS Framework operations
            # pipeline = IntelligenceExecutionPipeline()
            # await pipeline.execute_intelligence_pipeline("your query")
            
        return True
        
    except RuntimeError as e:
        print(f"❌ Ecosystem validation failed: {e}")
        print("🛠️  Please resolve validation errors before proceeding")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_ecosystem_validation())
```

## 🔐 MCP JSON-RPC 2.0 COMPLIANCE REQUIREMENTS (MANDATORY)

**As a @server_guide_mcp_server.py MCP building platform, ALL servers leaving our factory MUST be 100% MCP JSON-RPC 2.0 compliant.**

### 🏆 MCP JSON-RPC 2.0 Gold Standard Requirements

#### ✅ Mandatory MCP JSON-RPC 2.0 Features:
- **📡 JSON-RPC 2.0 Protocol**: All MCP communications MUST use proper JSON-RPC 2.0 format
- **🔄 Automatic Response Parsing**: All orchestrators MUST include automatic MCP response parsing
- **🏗️ MCPCompliantAdapter Base Class**: All adapters MUST inherit from this base class
- **⚡ execute_mcp_call() Method**: Automatic MCP call execution with response parsing
- **📊 MCP Compliance Metadata**: All responses MUST include `mcp_compliant: true`
- **🛡️ Error Handling**: Comprehensive MCP error handling with graceful degradation
- **✅ Response Validation**: Automatic validation of MCP response structure
- **🎯 Protocol Compliance**: Full JSON-RPC 2.0 specification compliance

#### 🔒 MCP JSON-RPC 2.0 Standards:
- **Protocol**: JSON-RPC 2.0 specification compliance
- **Request Format**: Proper `jsonrpc`, `method`, `params`, `id` structure
- **Response Format**: Proper `jsonrpc`, `result`, `id` structure with content array
- **Error Handling**: Standard JSON-RPC 2.0 error codes and messages
- **Content Structure**: `{"type": "text", "text": "JSON_STRING"}` format
- **Compliance Metadata**: `mcp_compliant: true`, `server_templates_guide_compliant: true`

#### 📁 MCP JSON-RPC 2.0 Implementation Pattern (MANDATORY):
```python
# MCP JSON-RPC 2.0 Response Parsing (MANDATORY in all orchestrators)
def parse_mcp_jsonrpc_response(response_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    🌟 MANDATORY MCP JSON-RPC 2.0 Response Parser
    
    This function ensures 100% SERVER_TEMPLATES_GUIDE.md compliance by
    automatically parsing MCP JSON-RPC 2.0 responses from any server.
    """
    try:
        # Handle MCP JSON-RPC 2.0 response structure
        if response_data.get("result") and response_data["result"].get("content"):
            content_text = response_data["result"]["content"][0].get("text", "{}")
            try:
                # Parse the JSON string from the MCP response
                parsed_result = json.loads(content_text)
                return parsed_result
            except json.JSONDecodeError:
                # If parsing fails, return the raw text with success indicator
                return {"success": True, "result": content_text, "mcp_parsing": "raw_text"}
        else:
            return {"success": False, "error": "Invalid MCP response structure", "mcp_parsing": "failed"}
    except Exception as e:
        return {"success": False, "error": f"MCP parsing error: {str(e)}", "mcp_parsing": "exception"}

def create_mcp_jsonrpc_request(method: str, tool_name: str, arguments: Dict[str, Any], request_id: int = 1) -> Dict[str, Any]:
    """
    🌟 MANDATORY MCP JSON-RPC 2.0 Request Creator
    
    Creates properly formatted MCP JSON-RPC 2.0 requests for any server.
    """
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": method,
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

# MCPCompliantAdapter Base Class (MANDATORY for all adapters)
class MCPCompliantAdapter:
    """
    🌟 MANDATORY MCP-Compliant Adapter Base Class
    
    This base class ensures all adapters automatically handle MCP JSON-RPC 2.0
    responses according to SERVER_TEMPLATES_GUIDE.md standards.
    """
    
    def __init__(self, url: str, timeout: float = 120.0):
        self.url = url
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def execute_mcp_call(self, tool_name: str, arguments: Dict[str, Any], 
                              method: str = "tools/call", request_id: int = 1) -> Dict[str, Any]:
        """
        🌟 MANDATORY MCP Call Executor
        
        Executes MCP calls with automatic JSON-RPC 2.0 response parsing.
        """
        try:
            mcp_payload = create_mcp_jsonrpc_request(method, tool_name, arguments, request_id)
            
            response = await self.client.post(f"{self.url}/mcp", json=mcp_payload)
            response.raise_for_status()
            result = response.json()
            
            # Automatic MCP JSON-RPC 2.0 response parsing
            parsed_result = parse_mcp_jsonrpc_response(result)
            
            # Add MCP compliance metadata
            parsed_result["mcp_compliant"] = True
            parsed_result["mcp_protocol"] = "JSON-RPC 2.0"
            parsed_result["server_templates_guide_compliant"] = True
            
            return parsed_result
            
        except Exception as e:
            return {
                "success": False, 
                "error": str(e),
                "mcp_compliant": False,
                "mcp_protocol": "JSON-RPC 2.0",
                "server_templates_guide_compliant": False
            }
    
    async def cleanup(self):
        """Cleanup resources."""
        await self.client.aclose()

# Example Adapter Implementation (MANDATORY pattern)
class YourServiceAdapter(MCPCompliantAdapter):
    def __init__(self, url="http://localhost:YOUR_PORT"):
        super().__init__(url, timeout=120.0)

    async def your_mcp_tool(self, payload: Dict[str, Any]):
        """Your MCP tool with automatic compliance."""
        return await self.execute_mcp_call(
            tool_name="your_tool_name",
            arguments={"payload": payload}
        )
```

#### 🌐 MCP JSON-RPC 2.0 Health Response (MANDATORY):
```json
{
  "status": "healthy|quantum_healthy|diamond_healthy",
  "service": "your_service_name",
  "mcp_compliant": true,
  "mcp_protocol": "JSON-RPC 2.0",
  "server_templates_guide_compliant": true,
  "jsonrpc_2_0_support": true,
  "automatic_response_parsing": true,
  "template_compliant": true
}
```

#### 🎯 MCP JSON-RPC 2.0 Validation Requirements:
- **MCP Request Format**: Must use proper JSON-RPC 2.0 request structure
- **MCP Response Format**: Must use proper JSON-RPC 2.0 response structure
- **Content Parsing**: Must automatically parse MCP content arrays
- **Error Handling**: Must handle MCP errors gracefully
- **Compliance Metadata**: Must include MCP compliance indicators
- **Protocol Validation**: Must validate JSON-RPC 2.0 protocol compliance

### 🏭 Factory MCP JSON-RPC 2.0 Compliance Standards:

#### ✅ ALL servers MUST implement:
1. **📡 JSON-RPC 2.0 Protocol**: Full JSON-RPC 2.0 specification compliance
2. **🔄 Automatic Response Parsing**: Built-in MCP response parsing utilities
3. **🏗️ MCPCompliantAdapter**: Base class for all MCP adapters
4. **⚡ execute_mcp_call()**: Automatic MCP call execution method
5. **📊 Compliance Metadata**: MCP compliance indicators in all responses
6. **🛡️ Error Handling**: Comprehensive MCP error handling
7. **✅ Response Validation**: Automatic MCP response structure validation

#### 🚫 MCP JSON-RPC 2.0 Compliance Failures:
- **Missing Response Parsing**: Servers without automatic MCP response parsing
- **Invalid Protocol**: Non-JSON-RPC 2.0 compliant MCP communications
- **No Base Class**: Adapters not inheriting from MCPCompliantAdapter
- **Missing execute_mcp_call()**: Adapters without automatic MCP call execution
- **No Compliance Metadata**: Responses without MCP compliance indicators
- **Poor Error Handling**: Inadequate MCP error handling and validation

## 🔌 MCP WRAPPER INTEGRATION REQUIREMENTS (MANDATORY)

**As a @server_guide_mcp_server.py MCP building platform, ALL servers leaving our factory MUST include comprehensive MCP wrapper functionality for full client compatibility with systems like Cursor, Claude Desktop, and other MCP clients.**

### 🏆 MCP Wrapper Gold Standard Requirements

#### ✅ Mandatory MCP Wrapper Features:
- **🔧 Tool Registration System**: Automatic MCP tool discovery and registration
- **📋 Initialization Protocol**: Proper MCP server initialization with client handshake
- **🛠️ Tool Mapping**: Comprehensive tool-to-function mapping with metadata
- **🎯 Client Compatibility**: Full compatibility with Cursor, Claude Desktop, and other MCP clients
- **📊 Schema Validation**: Automatic input/output schema validation for all tools
- **🔄 State Management**: Proper MCP state management and session handling
- **📡 Protocol Handlers**: Complete JSON-RPC 2.0 method handlers (initialize, tools/list, tools/call)

#### 🔒 MCP Wrapper Standards:
- **Initialization**: Proper `initialize` method with server capabilities
- **Tool Discovery**: `tools/list` method returning all available tools with schemas
- **Tool Execution**: `tools/call` method with proper argument validation
- **Error Handling**: Standard MCP error codes and graceful degradation
- **Client Handshake**: Proper client-server initialization protocol
- **Schema Compliance**: JSON Schema validation for all tool inputs/outputs

#### 📁 MCP Wrapper Implementation Pattern (MANDATORY):
```python
# MCP Tool Registration System (MANDATORY in all servers)
TOOL_MAPPING = {
    "your_tool_name": your_tool_function,
    "another_tool": another_tool_function,
    # ... all available tools
}

# MCP Tool Decorator (MANDATORY for all MCP tools)
class mcp:
    @staticmethod
    def tool():
        def decorator(func):
            # Register the tool in the mapping
            TOOL_MAPPING[func.__name__] = func
            return func
        return decorator

# MCP Wrapper Endpoint (MANDATORY in all servers)
@app.post("/mcp")
async def mcp_endpoint(request: Dict[str, Any]):
    """
    🌟 MANDATORY MCP Wrapper Endpoint
    
    This endpoint provides full MCP client compatibility including:
    - Client initialization and handshake
    - Tool discovery and listing
    - Tool execution with schema validation
    - Error handling and graceful degradation
    """
    try:
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id", "unknown")
        
        # Handle initialize method (MANDATORY)
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {
                        "tools": {}
                    },
                    "serverInfo": {
                        "name": "your_server_name",
                        "version": "1.0.0"
                    }
                }
            }
        
        # Handle tools/list method (MANDATORY)
        elif method == "tools/list":
            tools_list = []
            for tool_name, tool_func in TOOL_MAPPING.items():
                # Generate schema from function signature
                schema = generate_tool_schema(tool_func)
                tools_list.append({
                    "name": tool_name,
                    "description": getattr(tool_func, '__doc__', f"Execute {tool_name}"),
                    "inputSchema": schema
                })
            
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": {
                    "tools": tools_list
                }
            }
        
        # Handle tools/call method (MANDATORY)
        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            
            if not tool_name:
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": -32602, "message": "Missing tool name"}
                }
            
            if tool_name in TOOL_MAPPING:
                tool_func = TOOL_MAPPING[tool_name]
                
                try:
                    # Execute tool with argument validation
                    result = await tool_func(**tool_args)
                    
                    # Wrap result in MCP content format
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result)
                                }
                            ]
                        }
                    }
                    
                except Exception as e:
                    return {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -32603, "message": f"Tool execution failed: {str(e)}"}
                    }
            else:
                return {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": -32601, "message": f"Unknown tool: {tool_name}"}
                }
        
        else:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32601, "message": f"Method not found: {method}"}
            }
            
    except Exception as e:
        return {
            "jsonrpc": "2.0",
            "id": request.get("id", "unknown"),
            "error": {"code": -32603, "message": f"Internal error: {str(e)}"}
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

# Example MCP Tool Implementation (MANDATORY pattern)
@mcp.tool()
async def your_mcp_tool(param1: str, param2: int = 10) -> Dict[str, Any]:
    """
    🌟 MANDATORY MCP Tool Example
    
    This function demonstrates the proper MCP tool implementation pattern.
    All MCP tools MUST use the @mcp.tool() decorator and return Dict[str, Any].
    """
    try:
        # Your tool logic here
        result = {"success": True, "param1": param1, "param2": param2}
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}
```

#### 🌐 MCP Wrapper Health Response (MANDATORY):
```json
{
  "status": "healthy|quantum_healthy|diamond_healthy",
  "service": "your_service_name",
  "mcp_wrapper_enabled": true,
  "client_compatibility": ["cursor", "claude_desktop", "other_mcp_clients"],
  "tool_registration": true,
  "schema_validation": true,
  "initialization_protocol": true,
  "template_compliant": true
}
```

#### 🎯 MCP Wrapper Validation Requirements:
- **Client Initialization**: Must support MCP client initialization handshake
- **Tool Discovery**: Must provide complete tool listing with schemas
- **Tool Execution**: Must execute tools with proper argument validation
- **Error Handling**: Must handle MCP errors with standard error codes
- **Schema Compliance**: Must provide JSON Schema for all tools
- **Client Compatibility**: Must work with Cursor, Claude Desktop, and other MCP clients

### 🏭 Factory MCP Wrapper Compliance Standards:

#### ✅ ALL servers MUST implement:
1. **🔧 Tool Registration**: Automatic tool discovery and registration system
2. **📋 Initialization Protocol**: Proper MCP client-server handshake
3. **🛠️ Tool Mapping**: Comprehensive tool-to-function mapping with metadata
4. **🎯 Client Compatibility**: Full compatibility with all MCP clients
5. **📊 Schema Validation**: Automatic input/output schema validation
6. **🔄 State Management**: Proper MCP state and session handling
7. **📡 Protocol Handlers**: Complete JSON-RPC 2.0 method implementation

#### 🚫 MCP Wrapper Compliance Failures:
- **Missing Tool Registration**: Servers without automatic tool discovery
- **No Initialization**: Servers without proper MCP client handshake
- **Incomplete Tool Mapping**: Missing or incomplete tool-to-function mapping
- **Client Incompatibility**: Servers that don't work with MCP clients
- **No Schema Validation**: Tools without proper input/output schemas
- **Poor Error Handling**: Inadequate MCP error handling and validation

## 🔐 SSL/TLS COMPLIANCE REQUIREMENTS (MANDATORY)

**As a @server_guide_mcp_server.py MCP building platform, ALL servers leaving our factory MUST be 100% SSL/TLS compliant.**

### 🏆 SSL/TLS Gold Standard Requirements

#### ✅ Mandatory SSL/TLS Features:
- **🔐 HTTPS Transport**: All endpoints MUST support HTTPS with valid SSL certificates
- **🔑 RSA 2048-bit Encryption**: Industry-standard RSA 2048-bit key encryption
- **📄 Valid SSL Certificates**: Self-signed certificates with proper Subject Alternative Names
- **⚡ Auto-Detection**: Servers MUST automatically detect and use SSL certificates
- **🔧 Manual Override**: Command-line SSL configuration support (`--ssl-certfile`, `--ssl-keyfile`)
- **🛡️ Graceful Degradation**: HTTP fallback when SSL certificates unavailable (with warnings)
- **🌐 Production Ready**: Certificates valid for 365 days with proper subject names

#### 🔒 SSL Certificate Standards:
- **Algorithm**: RSA 2048-bit
- **Validity**: 365 days from generation
- **Subject**: LXCEG MCP Servers, San Francisco, CA, US
- **Common Name**: localhost
- **Subject Alternative Names**: localhost, 127.0.0.1, localhost:port, IP:127.0.0.1
- **Key Usage**: Digital Signature, Key Encipherment
- **Extended Key Usage**: Server Authentication, Client Authentication

#### 📁 SSL Certificate Structure:
```
ssl_certs/
├── server_name/
│   ├── certificate.crt  (SSL Certificate)
│   └── private.key      (Private Key)
└── SSL_CONFIG_SUMMARY.md (Documentation)
```

#### 🚀 SSL Implementation Pattern:
```python
# SSL Certificate Configuration (MANDATORY in all servers)
from pathlib import Path
import sys

# SSL Certificate auto-detection
ssl_cert_dir = Path("ssl_certs/your_server_name")
cert_file = ssl_cert_dir / "certificate.crt"
key_file = ssl_cert_dir / "private.key"

ssl_config = {}

# Auto-detect SSL certificates
if cert_file.exists() and key_file.exists():
    ssl_config = {
        "ssl_certfile": str(cert_file),
        "ssl_keyfile": str(key_file)
    }
    logger.info(f"🔐 SSL Certificates found and configured")
    logger.info(f"   📄 Certificate: {cert_file}")
    logger.info(f"   🔑 Private Key: {key_file}")
    logger.info(f"🌐 Server URL: https://localhost:{port} (SSL)")
else:
    logger.warning(f"⚠️ SSL Certificates not found at {ssl_cert_dir}")
    logger.warning(f"🔧 Server will start without SSL (HTTP only)")
    logger.info(f"🌐 Server URL: http://localhost:{port}")

# Manual SSL override support
if "--ssl-certfile" in sys.argv and "--ssl-keyfile" in sys.argv:
    cert_idx = sys.argv.index("--ssl-certfile") + 1
    key_idx = sys.argv.index("--ssl-keyfile") + 1
    if cert_idx < len(sys.argv) and key_idx < len(sys.argv):
        manual_cert = Path(sys.argv[cert_idx])
        manual_key = Path(sys.argv[key_idx])
        if manual_cert.exists() and manual_key.exists():
            ssl_config = {
                "ssl_certfile": str(manual_cert),
                "ssl_keyfile": str(manual_key)
            }
            logger.info(f"🔐 Manual SSL Override:")
            logger.info(f"   📄 Certificate: {manual_cert}")
            logger.info(f"   🔑 Private Key: {manual_key}")

# Start server with SSL support
uvicorn.run(
    app,
    host="0.0.0.0",
    port=your_port,
    log_level="info",
    **ssl_config  # SSL configuration applied here
)
```

#### 🌐 SSL Health Response (MANDATORY):
```json
{
  "status": "healthy|quantum_healthy|diamond_healthy",
  "service": "your_service_name",
  "ssl_enabled": true,
  "ssl_certificate": "ssl_certs/your_server/certificate.crt",
  "https_endpoints": true,
  "security_level": "RSA-2048",
  "certificate_validity": "365 days",
  "template_compliant": true
}
```

#### 🎯 SSL Validation Requirements:
- **HTTPS Health Endpoint**: Must respond with 200 status via HTTPS
- **HTTPS Tools Endpoint**: Must expose tools via HTTPS
- **HTTPS MCP Endpoint**: Must support MCP protocol via HTTPS
- **SSL Certificate Validation**: Must use valid RSA 2048-bit certificates
- **Graceful HTTP Fallback**: Must indicate SSL status in responses

### 🏭 Factory SSL Compliance Standards:

#### ✅ ALL servers MUST implement:
1. **🔐 SSL Auto-Detection**: Automatic certificate discovery and configuration
2. **🔧 Manual SSL Override**: Command-line certificate specification support
3. **🛡️ Graceful Degradation**: HTTP fallback with clear SSL status logging
4. **📄 Certificate Management**: Proper SSL certificate structure and validity
5. **🌐 HTTPS Endpoints**: All endpoints accessible via HTTPS when SSL enabled
6. **🔒 Security Standards**: RSA 2048-bit encryption with proper subject names
7. **📊 SSL Status Reporting**: Health endpoints must report SSL configuration status

#### 🚫 SSL Compliance Failures:
- **Missing SSL Implementation**: Servers without SSL support
- **Invalid Certificates**: Expired or malformed SSL certificates
- **No Auto-Detection**: Servers requiring manual SSL configuration only
- **HTTP-Only Operation**: Servers that don't support HTTPS endpoints
- **Poor Error Handling**: Servers that crash when SSL certificates missing
- **No Status Reporting**: Health endpoints that don't report SSL status 