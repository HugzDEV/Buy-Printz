"""
Railway Chrome Setup Configuration
This module handles Chrome browser setup for Railway deployment.
"""
import os
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

logger = logging.getLogger(__name__)

def setup_chrome_for_railway(headless: bool = True) -> webdriver.Chrome:
    """
    Setup Chrome driver optimized for Railway deployment.
    Railway provides Chrome binary in a specific location.
    """
    options = Options()
    
    if headless:
        options.add_argument('--headless')
    
    # Railway-specific Chrome options
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-backgrounding-occluded-windows')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--disable-features=TranslateUI')
    options.add_argument('--disable-ipc-flooding-protection')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--memory-pressure-off')
    options.add_argument('--max_old_space_size=4096')
    
    # User agent
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    # Railway Chrome binary path
    chrome_binary_path = os.getenv('CHROME_BINARY_PATH', '/usr/bin/google-chrome')
    if os.path.exists(chrome_binary_path):
        options.binary_location = chrome_binary_path
    
    # ChromeDriver path for Railway
    chromedriver_path = os.getenv('CHROMEDRIVER_PATH', '/usr/bin/chromedriver')
    
    try:
        if os.path.exists(chromedriver_path):
            service = Service(chromedriver_path)
            driver = webdriver.Chrome(service=service, options=options)
        else:
            # Fallback to system ChromeDriver
            driver = webdriver.Chrome(options=options)
        
        logger.info("Chrome driver initialized successfully for Railway")
        return driver
        
    except Exception as e:
        logger.error(f"Failed to initialize Chrome driver: {e}")
        raise

def check_railway_chrome_availability() -> dict:
    """
    Check if Chrome and ChromeDriver are available on Railway.
    """
    status = {
        'chrome_available': False,
        'chromedriver_available': False,
        'chrome_binary_path': None,
        'chromedriver_path': None
    }
    
    # Check Chrome binary
    chrome_paths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/opt/google/chrome/chrome'
    ]
    
    for path in chrome_paths:
        if os.path.exists(path):
            status['chrome_available'] = True
            status['chrome_binary_path'] = path
            break
    
    # Check ChromeDriver
    chromedriver_paths = [
        '/usr/bin/chromedriver',
        '/usr/local/bin/chromedriver',
        '/opt/chromedriver/chromedriver'
    ]
    
    for path in chromedriver_paths:
        if os.path.exists(path):
            status['chromedriver_available'] = True
            status['chromedriver_path'] = path
            break
    
    return status

def get_railway_chrome_config() -> dict:
    """
    Get Railway Chrome configuration for environment variables.
    """
    return {
        'CHROME_BINARY_PATH': '/usr/bin/google-chrome',
        'CHROMEDRIVER_PATH': '/usr/bin/chromedriver',
        'CHROME_HEADLESS': 'true',
        'CHROME_NO_SANDBOX': 'true',
        'CHROME_DISABLE_DEV_SHM': 'true'
    }
