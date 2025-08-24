"""
Pytest configuration and fixtures for Buy Printz testing suite
"""

import pytest
import os
import sys
from unittest.mock import Mock

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the FastAPI app"""
    from fastapi.testclient import TestClient
    from backend.main import app
    
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    """Mock Supabase client for testing"""
    mock_client = Mock()
    mock_client.auth.sign_up.return_value = Mock(user=Mock(id="test-user-id"))
    mock_client.auth.sign_in_with_password.return_value = Mock(
        user=Mock(id="test-user-id"),
        session=Mock(access_token="test-token")
    )
    return mock_client


@pytest.fixture
def mock_stripe():
    """Mock Stripe client for testing"""
    mock_stripe = Mock()
    mock_stripe.PaymentIntent.create.return_value = Mock(
        id="pi_test_123",
        client_secret="pi_test_123_secret_test"
    )
    return mock_stripe


@pytest.fixture
def sample_canvas_data():
    """Sample canvas data for testing"""
    return {
        "elements": [
            {
                "id": "text-1",
                "type": "text",
                "x": 100,
                "y": 100,
                "text": "Sample Text",
                "fontSize": 20,
                "fontFamily": "Arial",
                "fill": "#000000"
            },
            {
                "id": "rect-1", 
                "type": "rect",
                "x": 200,
                "y": 200,
                "width": 100,
                "height": 50,
                "fill": "#ff0000"
            }
        ]
    }


@pytest.fixture
def sample_order_data():
    """Sample order data for testing"""
    return {
        "product_type": "banner",
        "banner_type": "vinyl-13oz",
        "banner_material": "13oz Vinyl",
        "banner_finish": "Matte",
        "banner_size": "2ft x 4ft (landscape)",
        "orientation": "landscape",
        "quantity": 1,
        "grommets": "corners",
        "hemming": "standard",
        "custom_width": None,
        "custom_height": None,
        "canvas_data": {
            "elements": [],
            "canvasSize": {"width": 2400, "height": 1200},
            "backgroundColor": "#ffffff"
        },
        "total_amount": 25.00
    }


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Setup test environment variables"""
    os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
    os.environ.setdefault("SUPABASE_KEY", "test-key")
    os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_123")
    os.environ.setdefault("JWT_SECRET", "test-secret-key")
