#!/usr/bin/env python3
"""
Simple test to check B2Sign integration
"""

import asyncio
import sys
import logging

# Add backend to path
sys.path.append('backend')

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def simple_test():
    """Simple test"""
    try:
        logger.info("🚀 Starting simple test...")
        
        # Test import
        from backend.b2sign_playwright_integration import B2SignPlaywrightIntegration
        logger.info("✅ Import successful")
        
        # Test initialization
        integration = B2SignPlaywrightIntegration()
        logger.info("✅ Integration instance created")
        
        # Test browser initialization
        result = await integration.initialize()
        logger.info(f"✅ Browser initialization result: {result}")
        
        if result:
            # Test login
            login_result = await integration.login()
            logger.info(f"✅ Login result: {login_result}")
            
            # Cleanup
            await integration.cleanup()
            logger.info("✅ Cleanup completed")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(simple_test())
