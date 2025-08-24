"""
Frontend Component Testing Suite for Buy Printz Platform
Tests React components, routing, and user interactions
"""

import pytest
import json
import os


class TestReactComponents:
    """Test React component structure and props"""
    
    def test_package_json_structure(self):
        """Test package.json has correct dependencies"""
        package_path = os.path.join("frontend", "package.json")
        
        if os.path.exists(package_path):
            with open(package_path, 'r') as f:
                package_data = json.load(f)
            
            # Check essential dependencies
            dependencies = package_data.get("dependencies", {})
            
            expected_deps = [
                "react",
                "react-dom", 
                "react-router-dom",
                "konva",
                "react-konva",
                "jspdf",
                "html2canvas",
                "lucide-react"
            ]
            
            for dep in expected_deps:
                assert dep in dependencies, f"Missing dependency: {dep}"
        else:
            pytest.skip("package.json not found")

    def test_vite_config_exists(self):
        """Test Vite configuration exists"""
        vite_config_path = os.path.join("frontend", "vite.config.js")
        assert os.path.exists(vite_config_path), "vite.config.js should exist"

    def test_index_html_structure(self):
        """Test index.html has correct structure"""
        index_path = os.path.join("frontend", "index.html")
        
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                content = f.read()
            
            # Check for essential elements
            assert "<title>Buy Printz" in content
            assert 'id="root"' in content
            assert "favicon" in content.lower()
        else:
            pytest.skip("index.html not found")


class TestComponentFiles:
    """Test that all required component files exist"""
    
    def test_core_components_exist(self):
        """Test that all core components exist"""
        component_dir = os.path.join("frontend", "src", "components")
        
        required_components = [
            "App.jsx",
            "BannerEditor.jsx", 
            "Header.jsx",
            "Footer.jsx",
            "LandingPage.jsx",
            "Login.jsx",
            "Register.jsx",
            "Dashboard.jsx",
            "Checkout.jsx",
            "PrintPreviewModal.jsx",
            "OrderConfirmation.jsx"
        ]
        
        for component in required_components:
            component_path = os.path.join("frontend", "src", component)
            if not os.path.exists(component_path):
                component_path = os.path.join(component_dir, component)
            
            assert os.path.exists(component_path), f"Component {component} should exist"

    def test_service_files_exist(self):
        """Test that service files exist"""
        services_dir = os.path.join("frontend", "src", "services")
        
        required_services = [
            "auth.js",
            "canvasState.js"
        ]
        
        for service in required_services:
            service_path = os.path.join(services_dir, service)
            assert os.path.exists(service_path), f"Service {service} should exist"


class TestRouting:
    """Test routing configuration"""
    
    def test_app_jsx_has_routing(self):
        """Test that App.jsx contains routing configuration"""
        app_path = os.path.join("frontend", "src", "App.jsx")
        
        if os.path.exists(app_path):
            with open(app_path, 'r') as f:
                content = f.read()
            
            # Check for React Router components
            assert "BrowserRouter" in content or "Router" in content
            assert "Routes" in content or "Route" in content
            assert "Route" in content
        else:
            pytest.skip("App.jsx not found")


class TestAssets:
    """Test asset files and images"""
    
    def test_logo_assets_exist(self):
        """Test that logo assets exist"""
        logo_paths = [
            os.path.join("frontend", "src", "assets", "images", "BuyPrintz_LOGO_Final-Social Media_Transparent.png"),
            os.path.join("frontend", "public", "assets", "images", "BuyPrintz_LOGO_Final-Social Media_Transparent.png")
        ]
        
        logo_exists = any(os.path.exists(path) for path in logo_paths)
        assert logo_exists, "Buy Printz logo should exist in assets"

    def test_css_files_exist(self):
        """Test that CSS files exist"""
        css_files = [
            os.path.join("frontend", "src", "index.css"),
            os.path.join("frontend", "tailwind.config.js"),
            os.path.join("frontend", "postcss.config.js")
        ]
        
        for css_file in css_files:
            assert os.path.exists(css_file), f"CSS file {css_file} should exist"


class TestConfiguration:
    """Test configuration files"""
    
    def test_tailwind_config(self):
        """Test Tailwind configuration"""
        tailwind_path = os.path.join("frontend", "tailwind.config.js")
        
        if os.path.exists(tailwind_path):
            with open(tailwind_path, 'r') as f:
                content = f.read()
            
            # Check for essential Tailwind config
            assert "content:" in content
            assert "theme:" in content or "extend:" in content
        else:
            pytest.skip("tailwind.config.js not found")

    def test_env_example_exists(self):
        """Test that env.example exists for configuration reference"""
        env_example_path = "env.example"
        assert os.path.exists(env_example_path), "env.example should exist for configuration"


class TestCodeQuality:
    """Test code quality and standards"""
    
    def test_no_console_logs_in_production_components(self):
        """Test that console.log statements are minimal in production code"""
        component_dir = os.path.join("frontend", "src", "components")
        
        if os.path.exists(component_dir):
            for root, dirs, files in os.walk(component_dir):
                for file in files:
                    if file.endswith(('.jsx', '.js')):
                        file_path = os.path.join(root, file)
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Count console.log occurrences (allow some for debugging)
                        console_logs = content.count('console.log')
                        assert console_logs < 10, f"Too many console.log statements in {file}: {console_logs}"

    def test_no_test_files_in_production(self):
        """Test that test files are not included in production build"""
        src_dir = os.path.join("frontend", "src")
        
        if os.path.exists(src_dir):
            for root, dirs, files in os.walk(src_dir):
                for file in files:
                    # Check for obvious test files that shouldn't be in production
                    assert not file.startswith('test-'), f"Test file {file} should not be in src/"
                    assert not file.endswith('.test.js'), f"Test file {file} should not be in src/"
                    assert not file.endswith('.test.jsx'), f"Test file {file} should not be in src/"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
