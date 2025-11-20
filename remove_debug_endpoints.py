#!/usr/bin/env python3
"""
Script to remove debug endpoints from main.py
"""

import re

def remove_debug_endpoints():
    with open('backend/main.py', 'r') as f:
        content = f.read()
    
    # List of debug endpoints to remove
    debug_endpoints = [
        r'@app\.get\("/api/debug"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/templates/test"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/test/file-exists/.*?"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/test/thumbnail-dependencies"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/database/test"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/auth/test"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/canvas/test"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/debug/auth"\).*?(?=@app\.|$)',
        r'@app\.get\("/api/debug/auth-required"\).*?(?=@app\.|$)',
    ]
    
    # Remove each debug endpoint
    for pattern in debug_endpoints:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Clean up extra newlines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    with open('backend/main.py', 'w') as f:
        f.write(content)
    
    print("Debug endpoints removed from main.py")

if __name__ == "__main__":
    remove_debug_endpoints()
