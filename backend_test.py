#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class B2BLogisticsTester:
    def __init__(self, base_url="https://b2b-logistics-5.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different user types
        self.profiles = {}  # Store profile IDs
        self.test_data = {}  # Store created test data
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, user_type=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        # Add auth token if user_type specified
        if user_type and user_type in self.tokens:
            default_headers['Authorization'] = f'Bearer {self.tokens[user_type]}'
        
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test authentication for all user types"""
        print(f"\n{'='*50}")
        print("TESTING AUTHENTICATION")
        print(f"{'='*50}")
        
        user_types = ['manufacturer', 'importer', 'admin']
        timestamp = int(time.time())
        
        for user_type in user_types:
            print(f"\n--- Testing {user_type.upper()} Authentication ---")
            
            email = f"test_{user_type}_{timestamp}@example.com"
            password = "TestPass123!"
            
            # Test registration
            success, response = self.run_test(
                f"{user_type.title()} Registration",
                "POST",
                "/auth/register",
                200,
                data={
                    "email": email,
                    "password": password,
                    "role": user_type
                }
            )
            
            if success and 'access_token' in response:
                self.tokens[user_type] = response['access_token']
                print(f"   Token stored for {user_type}")
            
            # Test login
            success, response = self.run_test(
                f"{user_type.title()} Login",
                "POST", 
                "/auth/login",
                200,
                data={
                    "email": email,
                    "password": password
                }
            )
            
            # Test /auth/me endpoint
            self.run_test(
                f"{user_type.title()} Get Profile Info",
                "GET",
                "/auth/me",
                200,
                user_type=user_type
            )
        
        return len(self.tokens) >= 3

    def test_manufacturer_flow(self):
        """Test manufacturer-specific functionality"""
        if 'manufacturer' not in self.tokens:
            print("❌ Manufacturer token not available, skipping manufacturer tests")
            return False
            
        print(f"\n{'='*50}")
        print("TESTING MANUFACTURER FUNCTIONALITY")
        print(f"{'='*50}")
        
        # Create manufacturer profile
        profile_data = {
            "company_name": "Test Manufacturing Co",
            "address": "123 Factory St, Industrial Area",
            "factory_address": "456 Production Rd",
            "warehouse_address": "789 Storage Ave",
            "bank_account": "ACC-123456789",
            "is_available": True
        }
        
        success, response = self.run_test(
            "Create Manufacturer Profile",
            "POST",
            "/manufacturers/profile",
            200,
            data=profile_data,
            user_type='manufacturer'
        )
        
        if success:
            self.profiles['manufacturer'] = response.get('id')
        
        # Get manufacturer profile
        self.run_test(
            "Get Manufacturer Profile",
            "GET",
            "/manufacturers/profile",
            200,
            user_type='manufacturer'
        )
        
        # Update availability toggle
        self.run_test(
            "Update Manufacturer Availability",
            "POST",
            "/manufacturers/availability",
            200,
            data={"is_available": False},
            user_type='manufacturer'
        )
        
        # Create product
        product_data = {
            "name": "Industrial Widget",
            "description": "High-quality industrial widget for manufacturing",
            "specifications": "Material: Steel, Size: 10x5x2 cm, Weight: 500g",
            "quantity": 1000,
            "quality": "Grade A",
            "certifications": ["ISO 9001", "CE Marking"],
            "packaging": "Bulk packaging in cardboard boxes",
            "production_capacity": "10,000 units per month",
            "export_countries": ["USA", "Germany", "Japan"],
            "moq": 100
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "/manufacturers/products",
            200,
            data=product_data,
            user_type='manufacturer'
        )
        
        if success:
            self.test_data['product_id'] = response.get('id')
        
        # Get manufacturer products
        self.run_test(
            "Get Manufacturer Products",
            "GET",
            "/manufacturers/products",
            200,
            user_type='manufacturer'
        )
        
        # Get open requirements
        self.run_test(
            "Get Open Requirements",
            "GET",
            "/manufacturers/requirements",
            200,
            user_type='manufacturer'
        )
        
        return True

    def test_importer_flow(self):
        """Test importer-specific functionality"""
        if 'importer' not in self.tokens:
            print("❌ Importer token not available, skipping importer tests")
            return False
            
        print(f"\n{'='*50}")
        print("TESTING IMPORTER FUNCTIONALITY")
        print(f"{'='*50}")
        
        # Create importer profile
        profile_data = {
            "company_name": "Global Import Solutions",
            "address": "100 Trade Center, Business District",
            "country": "United States",
            "phone": "+1-555-123-4567",
            "email": "contact@globalimport.com"
        }
        
        success, response = self.run_test(
            "Create Importer Profile",
            "POST",
            "/importers/profile",
            200,
            data=profile_data,
            user_type='importer'
        )
        
        if success:
            self.profiles['importer'] = response.get('id')
        
        # Get importer profile
        self.run_test(
            "Get Importer Profile",
            "GET",
            "/importers/profile",
            200,
            user_type='importer'
        )
        
        # Create requirement
        requirement_data = {
            "hsn_code": "8481.20.10",
            "quantity": 500,
            "quality_requirements": "Industrial grade, corrosion resistant",
            "port_details": "Port of Los Angeles, CA",
            "destination_details": "Chicago, IL warehouse",
            "shipping_terms": "FOB",
            "certification_requirements": "CE marking required",
            "payment_details": "Letter of Credit, 30 days",
            "additional_info": "Urgent requirement for ongoing project"
        }
        
        success, response = self.run_test(
            "Create Requirement",
            "POST",
            "/importers/requirements",
            200,
            data=requirement_data,
            user_type='importer'
        )
        
        if success:
            self.test_data['requirement_id'] = response.get('id')
        
        # Get importer requirements
        self.run_test(
            "Get Importer Requirements",
            "GET",
            "/importers/requirements",
            200,
            user_type='importer'
        )
        
        return True

    def test_manufacturer_bidding(self):
        """Test manufacturer bidding on requirements"""
        if 'manufacturer' not in self.tokens or 'requirement_id' not in self.test_data:
            print("❌ Prerequisites not met for bidding tests")
            return False
            
        print(f"\n{'='*50}")
        print("TESTING BIDDING FUNCTIONALITY")
        print(f"{'='*50}")
        
        # Create bid
        bid_data = {
            "requirement_id": self.test_data['requirement_id'],
            "price": 25.50,
            "delivery_time": "30 days from order confirmation",
            "terms": "FOB factory, payment by L/C"
        }
        
        success, response = self.run_test(
            "Create Bid",
            "POST",
            "/manufacturers/bids",
            200,
            data=bid_data,
            user_type='manufacturer'
        )
        
        if success:
            self.test_data['bid_id'] = response.get('id')
        
        # Get manufacturer bids
        self.run_test(
            "Get Manufacturer Bids",
            "GET",
            "/manufacturers/bids",
            200,
            user_type='manufacturer'
        )
        
        # Test importer viewing quotations
        if 'requirement_id' in self.test_data:
            self.run_test(
                "Get Requirement Quotations",
                "GET",
                f"/importers/quotations/{self.test_data['requirement_id']}",
                200,
                user_type='importer'
            )
        
        return True

    def test_order_management(self):
        """Test order creation and management"""
        if 'requirement_id' not in self.test_data or 'bid_id' not in self.test_data:
            print("❌ Prerequisites not met for order tests")
            return False
            
        print(f"\n{'='*50}")
        print("TESTING ORDER MANAGEMENT")
        print(f"{'='*50}")
        
        # Create order (contract)
        success, response = self.run_test(
            "Contract Order",
            "POST",
            "/importers/orders",
            200,
            data={
                "requirement_id": self.test_data['requirement_id'],
                "bid_id": self.test_data['bid_id']
            },
            user_type='importer'
        )
        
        if success:
            self.test_data['order_id'] = response.get('id')
        
        # Get importer orders
        self.run_test(
            "Get Importer Orders",
            "GET",
            "/importers/orders",
            200,
            user_type='importer'
        )
        
        # Get manufacturer orders
        self.run_test(
            "Get Manufacturer Orders",
            "GET",
            "/manufacturers/orders",
            200,
            user_type='manufacturer'
        )
        
        # Update order progress
        if 'order_id' in self.test_data:
            self.run_test(
                "Update Order Progress",
                "PUT",
                f"/manufacturers/orders/{self.test_data['order_id']}/progress",
                200,
                data={"progress": "Production started"},
                user_type='manufacturer'
            )
        
        return True

    def test_admin_functionality(self):
        """Test admin functionality"""
        if 'admin' not in self.tokens:
            print("❌ Admin token not available, skipping admin tests")
            return False
            
        print(f"\n{'='*50}")
        print("TESTING ADMIN FUNCTIONALITY")
        print(f"{'='*50}")
        
        # Get all requirements
        self.run_test(
            "Admin Get Requirements",
            "GET",
            "/admin/requirements",
            200,
            user_type='admin'
        )
        
        # Update requirement status
        if 'requirement_id' in self.test_data:
            self.run_test(
                "Admin Update Requirement Status",
                "PUT",
                f"/admin/requirements/{self.test_data['requirement_id']}/status",
                200,
                data={"status": "open_for_bidding"},
                user_type='admin'
            )
        
        # Get all bids
        self.run_test(
            "Admin Get Bids",
            "GET",
            "/admin/bids",
            200,
            user_type='admin'
        )
        
        # Get all orders
        self.run_test(
            "Admin Get Orders",
            "GET",
            "/admin/orders",
            200,
            user_type='admin'
        )
        
        # Update order
        if 'order_id' in self.test_data:
            self.run_test(
                "Admin Update Order",
                "PUT",
                f"/admin/orders/{self.test_data['order_id']}",
                200,
                data={
                    "status": "shipped",
                    "vessel_mmsi": 123456789
                },
                user_type='admin'
            )
        
        return True

    def test_vessel_tracking(self):
        """Test vessel tracking functionality"""
        print(f"\n{'='*50}")
        print("TESTING VESSEL TRACKING")
        print(f"{'='*50}")
        
        # Test vessel tracking
        test_mmsi = 123456789
        success, response = self.run_test(
            "Track Vessel",
            "GET",
            f"/vessels/track/{test_mmsi}",
            200,
            user_type='importer'
        )
        
        if success:
            print(f"   Vessel data: MMSI={response.get('mmsi')}, Lat={response.get('latitude')}, Lng={response.get('longitude')}")
        
        return success

    def run_all_tests(self):
        """Run complete test suite"""
        print(f"\n🚀 Starting B2B Logistics Platform API Tests")
        print(f"Backend URL: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run test flows
        auth_success = self.test_auth_flow()
        if not auth_success:
            print("\n❌ Authentication tests failed - cannot continue")
            return False
        
        manufacturer_success = self.test_manufacturer_flow()
        importer_success = self.test_importer_flow()
        
        # Only run dependent tests if prerequisites are met
        if manufacturer_success and importer_success:
            self.test_manufacturer_bidding()
            self.test_order_management()
        
        self.test_admin_functionality()
        self.test_vessel_tracking()
        
        # Print summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print stored test data
        if self.test_data:
            print(f"\n📊 Created Test Data:")
            for key, value in self.test_data.items():
                print(f"   {key}: {value}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = B2BLogisticsTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())