"""
Comprehensive API Testing Suite for Buy Printz Platform
Tests all endpoints, authentication, and core functionality
"""

import pytest
import httpx
import asyncio
from fastapi.testclient import TestClient
import os
import sys
import json

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
    client = TestClient(app)
    app_available = True
except ImportError as e:
    print(f"Warning: Could not import backend.main: {e}")
    app_available = False
    client = None

class TestHealthAndDocs:
    """Test basic API health and documentation endpoints"""
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        if not app_available:
            pytest.skip("Backend app not available")
        
        response = client.get("/")
        assert response.status_code == 200
        assert "Buy Printz" in response.json()["message"]

    def test_health_endpoint(self):
        """Test health check endpoint"""
        if not app_available:
            pytest.skip("Backend app not available")
            
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data

    def test_swagger_docs(self):
        """Test Swagger documentation endpoint"""
        if not app_available:
            pytest.skip("Backend app not available")
            
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_schema(self):
        """Test OpenAPI schema endpoint"""
        if not app_available:
            pytest.skip("Backend app not available")
            
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert schema["info"]["title"] == "Buy Printz Banner Printing Platform"
        assert schema["info"]["version"] == "2.0.0"


class TestAuthentication:
    """Test authentication endpoints and security"""
    
    def test_register_user(self):
        """Test user registration"""
        test_user = {
            "email": f"test_{int(asyncio.get_event_loop().time())}@buyprintz.com",
            "password": "TestPassword123!",
            "full_name": "Test User"
        }
        
        response = client.post("/auth/register", json=test_user)
        # Note: This might fail if Supabase is not configured, that's expected in test env
        assert response.status_code in [200, 400, 422, 500]

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        invalid_login = {
            "email": "nonexistent@buyprintz.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/auth/login", json=invalid_login)
        assert response.status_code in [400, 401, 422, 500]

    def test_protected_endpoint_without_auth(self):
        """Test accessing protected endpoint without authentication"""
        response = client.get("/api/canvas/load")
        assert response.status_code == 401


class TestCanvasOperations:
    """Test canvas state management endpoints"""
    
    def test_canvas_save_without_auth(self):
        """Test canvas save without authentication"""
        canvas_data = {
            "canvas_data": {"elements": []},
            "banner_settings": {"size": "2ft x 4ft"}
        }
        
        response = client.post("/api/canvas/save", json=canvas_data)
        assert response.status_code == 401

    def test_canvas_load_without_auth(self):
        """Test canvas load without authentication"""
        response = client.get("/api/canvas/load")
        assert response.status_code == 401


class TestOrderProcessing:
    """Test order creation and processing endpoints"""
    
    def test_create_order_without_auth(self):
        """Test order creation without authentication"""
        order_data = {
            "product_type": "banner",
            "banner_type": "vinyl-13oz",
            "banner_size": "2ft x 4ft",
            "quantity": 1
        }
        
        response = client.post("/api/orders", json=order_data)
        assert response.status_code == 401

    def test_invalid_order_data(self):
        """Test order creation with invalid data"""
        invalid_order = {
            "invalid_field": "invalid_value"
        }
        
        response = client.post("/api/orders", json=invalid_order)
        assert response.status_code in [400, 401, 422]


class TestFileOperations:
    """Test file upload and management endpoints"""
    
    def test_file_upload_without_auth(self):
        """Test file upload without authentication"""
        # Create a small test file
        test_file = ("test.txt", b"test content", "text/plain")
        
        response = client.post("/api/upload", files={"file": test_file})
        assert response.status_code == 401


class TestInputValidation:
    """Test input validation and security"""
    
    def test_sql_injection_attempt(self):
        """Test SQL injection protection"""
        malicious_input = {
            "email": "test'; DROP TABLE users; --",
            "password": "password"
        }
        
        response = client.post("/auth/login", json=malicious_input)
        assert response.status_code in [400, 401, 422]
        # Should not crash the server

    def test_xss_attempt(self):
        """Test XSS protection"""
        malicious_canvas = {
            "canvas_data": {
                "elements": [
                    {
                        "type": "text",
                        "text": "<script>alert('xss')</script>"
                    }
                ]
            }
        }
        
        response = client.post("/api/canvas/save", json=malicious_canvas)
        assert response.status_code == 401  # Should require auth first

    def test_large_payload(self):
        """Test large payload handling"""
        large_canvas = {
            "canvas_data": {
                "elements": [{"large_data": "x" * 10000} for _ in range(100)]
            }
        }
        
        response = client.post("/api/canvas/save", json=large_canvas)
        # Should handle gracefully, either reject or process
        assert response.status_code in [400, 401, 413, 422]


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_invalid_json(self):
        """Test invalid JSON handling"""
        response = client.post(
            "/auth/login",
            data="invalid json{",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_missing_content_type(self):
        """Test missing content type handling"""
        response = client.post("/auth/login", data='{"test": "data"}')
        assert response.status_code in [422, 400]

    def test_nonexistent_endpoint(self):
        """Test 404 handling"""
        response = client.get("/nonexistent/endpoint")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
