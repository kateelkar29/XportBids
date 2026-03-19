from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import requests
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Storage configuration
STORAGE_URL = os.environ.get('STORAGE_URL')
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
APP_NAME = os.environ.get('APP_NAME', 'b2b-logistics')
storage_key = None

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 72))

# Create the main app without a prefix
app = FastAPI(title="B2B Logistics Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ========== STORAGE SERVICE ==========
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": EMERGENT_KEY},
            timeout=30
        )
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        raise


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ========== MARINE TRAFFIC SERVICE ==========
class MarineTrafficService:
    def __init__(self):
        self.base_url = "https://services.marinetraffic.com/api/"
        self.api_key = "demo_key"  # Using demo for now
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def get_vessel_position(self, mmsi: int) -> Optional[dict]:
        try:
            # For demo purposes, return mock data
            # In production, use actual API call
            return {
                "mmsi": mmsi,
                "latitude": 37.5 + (mmsi % 10) * 0.1,
                "longitude": -25.3 + (mmsi % 10) * 0.1,
                "speed": 15.5,
                "heading": 45,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "underway"
            }
        except Exception as e:
            logger.error(f"Error fetching vessel position: {e}")
            return None


# ========== MODELS ==========
class UserRole:
    MANUFACTURER = "manufacturer"
    IMPORTER = "importer"
    ADMIN = "admin"


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str = Field(exclude=True)
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


class ManufacturerProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    address: str
    factory_address: str
    warehouse_address: str
    bank_account: str
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ImporterProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    address: str
    country: str
    phone: str
    email: EmailStr
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    manufacturer_id: str
    name: str
    category: str  # New: Product category for matching
    description: str
    material: str  # New: Material for matching
    specifications: str
    quantity: int
    quality: str
    certifications: List[str]
    packaging: str  # New: Packaging capability
    production_capacity: str
    export_experience: bool = True  # New: Export experience
    supported_incoterms: List[str] = []  # New: FOB, CIF, CNF, etc.
    export_countries: List[str]
    moq: int
    images: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Requirement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    importer_id: str
    category: str  # New: Product category for matching
    material: Optional[str] = None  # New: Material preference for matching
    hsn_code: str
    quantity: int
    quality_requirements: str
    port_details: str
    destination_details: str
    shipping_terms: str
    certification_requirements: str
    payment_details: str
    additional_info: str
    documents: List[str] = []
    status: str = "pending"  # pending, open_for_bidding, contracted, in_progress, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Bid(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requirement_id: str
    manufacturer_id: str
    price: float
    delivery_time: str
    terms: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requirement_id: str
    importer_id: str
    manufacturer_id: str
    bid_id: str
    status: str = "in_progress"  # in_progress, shipped, delivered, completed
    progress: str = "Order placed"
    vessel_mmsi: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MatchIndicator(BaseModel):
    category_match: bool
    material_match: bool
    certification_match: bool
    moq_match: bool
    capacity_match: bool
    incoterm_match: bool
    match_score: int  # 0-100


class MatchedRequirement(BaseModel):
    requirement: Requirement
    match_indicator: MatchIndicator


# ========== MATCHING LOGIC ==========
def calculate_match(product: dict, requirement: dict) -> MatchIndicator:
    """
    Calculate match score between a manufacturer's product and an importer's requirement
    """
    # Category match (mandatory)
    category_match = product.get('category', '').lower() == requirement.get('category', '').lower()
    
    # Material match (if specified in requirement)
    material_match = True
    if requirement.get('material'):
        material_match = product.get('material', '').lower() == requirement.get('material', '').lower()
    
    # Certification match (if specified)
    certification_match = True
    req_certs = requirement.get('certification_requirements', '').lower()
    if req_certs and req_certs != 'none' and req_certs != 'not required':
        product_certs = [c.lower() for c in product.get('certifications', [])]
        # Check if any required certification is in product certifications
        certification_match = any(cert in ' '.join(product_certs) for cert in req_certs.split(','))
    
    # MOQ match (product MOQ should be <= requirement quantity)
    moq_match = product.get('moq', 0) <= requirement.get('quantity', 0)
    
    # Capacity match (rough estimation - production capacity vs order quantity)
    capacity_match = True
    try:
        capacity_str = product.get('production_capacity', '0')
        # Extract number from capacity string (e.g., "10000 units/month")
        capacity_num = int(''.join(filter(str.isdigit, capacity_str)))
        if capacity_num > 0:
            capacity_match = capacity_num >= requirement.get('quantity', 0)
    except:
        pass
    
    # Incoterm match
    incoterm_match = True
    req_incoterm = requirement.get('shipping_terms', '').upper()
    if req_incoterm:
        supported_incoterms = [i.upper() for i in product.get('supported_incoterms', [])]
        if supported_incoterms:
            incoterm_match = any(inco in req_incoterm for inco in supported_incoterms)
    
    # Calculate match score (0-100)
    score = 0
    if category_match:
        score += 40  # Category is most important
    if material_match:
        score += 15
    if certification_match:
        score += 15
    if moq_match:
        score += 10
    if capacity_match:
        score += 10
    if incoterm_match:
        score += 10
    
    return MatchIndicator(
        category_match=category_match,
        material_match=material_match,
        certification_match=certification_match,
        moq_match=moq_match,
        capacity_match=capacity_match,
        incoterm_match=incoterm_match,
        match_score=score
    )


class FileUpload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    storage_path: str
    original_filename: str
    content_type: str
    size: int
    uploaded_by: str
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ========== INPUT MODELS FOR API ==========
class ManufacturerProfileInput(BaseModel):
    company_name: str
    address: str
    factory_address: str
    warehouse_address: str
    bank_account: str
    is_available: bool = True


class ImporterProfileInput(BaseModel):
    company_name: str
    address: str
    country: str
    phone: str
    email: EmailStr


class ProductInput(BaseModel):
    name: str
    description: str
    specifications: str
    quantity: int
    quality: str
    certifications: List[str]
    packaging: str
    production_capacity: str
    export_countries: List[str]
    moq: int
    images: List[str] = []


class RequirementInput(BaseModel):
    hsn_code: str
    quantity: int
    quality_requirements: str
    port_details: str
    destination_details: str
    shipping_terms: str
    certification_requirements: str
    payment_details: str
    additional_info: str
    documents: List[str] = []


class BidInput(BaseModel):
    requirement_id: str
    price: float
    delivery_time: str
    terms: str

# ========== AUTH HELPERS ==========
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ========== AUTH ROUTES ==========
@api_router.post("/auth/register", response_model=Token)
async def register(input: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=input.email,
        password_hash=hash_password(input.password),
        role=input.role
    )
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create token
    token = create_token(user.id, user.role)
    return Token(access_token=token, user_id=user.id, role=user.role)


@api_router.post("/auth/login", response_model=Token)
async def login(input: UserLogin):
    user = await db.users.find_one({"email": input.email})
    if not user or not verify_password(input.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], user['role'])
    return Token(access_token=token, user_id=user['id'], role=user['role'])


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user['id'], "email": current_user['email'], "role": current_user['role']}


# ========== MANUFACTURER ROUTES ==========
@api_router.post("/manufacturers/profile", response_model=ManufacturerProfile)
async def create_manufacturer_profile(input: ManufacturerProfileInput, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.MANUFACTURER:
        raise HTTPException(status_code=403, detail="Only manufacturers can create profiles")
    
    profile = ManufacturerProfile(**input.model_dump(), user_id=current_user['id'])
    doc = profile.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.manufacturer_profiles.insert_one(doc)
    return profile


@api_router.get("/manufacturers/profile", response_model=ManufacturerProfile)
async def get_manufacturer_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@api_router.put("/manufacturers/profile")
async def update_manufacturer_profile(input: dict, current_user: dict = Depends(get_current_user)):
    await db.manufacturer_profiles.update_one({"user_id": current_user['id']}, {"$set": input})
    return {"message": "Profile updated"}


@api_router.post("/manufacturers/availability")
async def update_availability(request: dict, current_user: dict = Depends(get_current_user)):
    is_available = request.get('is_available')
    await db.manufacturer_profiles.update_one(
        {"user_id": current_user['id']},
        {"$set": {"is_available": is_available}}
    )
    return {"message": "Availability updated", "is_available": is_available}


@api_router.post("/manufacturers/products", response_model=Product)
async def create_product(input: ProductInput, current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    product = Product(**input.model_dump(), manufacturer_id=profile['id'])
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product


@api_router.get("/manufacturers/products", response_model=List[Product])
async def get_manufacturer_products(current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    products = await db.products.find({"manufacturer_id": profile['id']}, {"_id": 0}).to_list(1000)
    return products


@api_router.get("/manufacturers/requirements", response_model=List[Requirement])
async def get_open_requirements(current_user: dict = Depends(get_current_user)):
    requirements = await db.requirements.find({"status": "open_for_bidding"}, {"_id": 0}).to_list(1000)
    return requirements


@api_router.get("/manufacturers/matched-requirements")
async def get_matched_requirements(current_user: dict = Depends(get_current_user)):
    """
    Get requirements matched to manufacturer's products based on category, material, certifications, MOQ, and capacity
    """
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    
    # Get manufacturer's products
    products = await db.products.find({"manufacturer_id": profile['id']}, {"_id": 0}).to_list(1000)
    if not products:
        return []
    
    # Get all open requirements
    requirements = await db.requirements.find({"status": "open_for_bidding"}, {"_id": 0}).to_list(1000)
    
    # Match requirements with products
    matched_requirements = []
    for requirement in requirements:
        best_match_score = 0
        best_match_indicator = None
        
        # Find the best matching product for this requirement
        for product in products:
            match_indicator = calculate_match(product, requirement)
            
            # Only include if category matches (mandatory) and score >= 50
            if match_indicator.category_match and match_indicator.match_score >= 50:
                if match_indicator.match_score > best_match_score:
                    best_match_score = match_indicator.match_score
                    best_match_indicator = match_indicator
        
        # Add requirement if a good match was found
        if best_match_indicator:
            matched_requirements.append({
                "requirement": requirement,
                "match_indicator": best_match_indicator.model_dump()
            })
    
    # Sort by match score (highest first)
    matched_requirements.sort(key=lambda x: x['match_indicator']['match_score'], reverse=True)
    
    return matched_requirements


@api_router.post("/manufacturers/bids", response_model=Bid)
async def create_bid(input: BidInput, current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    bid = Bid(**input.model_dump(), manufacturer_id=profile['id'])
    doc = bid.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.bids.insert_one(doc)
    return bid


@api_router.get("/manufacturers/bids", response_model=List[Bid])
async def get_manufacturer_bids(current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    bids = await db.bids.find({"manufacturer_id": profile['id']}, {"_id": 0}).to_list(1000)
    return bids


@api_router.get("/manufacturers/orders", response_model=List[Order])
async def get_manufacturer_orders(current_user: dict = Depends(get_current_user)):
    profile = await db.manufacturer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    orders = await db.orders.find({"manufacturer_id": profile['id']}, {"_id": 0}).to_list(1000)
    return orders


@api_router.put("/manufacturers/orders/{order_id}/progress")
async def update_order_progress(order_id: str, request: dict, current_user: dict = Depends(get_current_user)):
    progress = request.get('progress')
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"progress": progress, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Order progress updated"}


# ========== IMPORTER ROUTES ==========
@api_router.post("/importers/profile", response_model=ImporterProfile)
async def create_importer_profile(input: ImporterProfileInput, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.IMPORTER:
        raise HTTPException(status_code=403, detail="Only importers can create profiles")
    
    profile = ImporterProfile(**input.model_dump(), user_id=current_user['id'])
    doc = profile.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.importer_profiles.insert_one(doc)
    return profile


@api_router.get("/importers/profile", response_model=ImporterProfile)
async def get_importer_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.importer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@api_router.put("/importers/profile")
async def update_importer_profile(input: dict, current_user: dict = Depends(get_current_user)):
    await db.importer_profiles.update_one({"user_id": current_user['id']}, {"$set": input})
    return {"message": "Profile updated"}


@api_router.post("/importers/requirements", response_model=Requirement)
async def create_requirement(input: RequirementInput, current_user: dict = Depends(get_current_user)):
    profile = await db.importer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    requirement = Requirement(**input.model_dump(), importer_id=profile['id'])
    doc = requirement.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.requirements.insert_one(doc)
    return requirement


@api_router.get("/importers/requirements", response_model=List[Requirement])
async def get_importer_requirements(current_user: dict = Depends(get_current_user)):
    profile = await db.importer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    requirements = await db.requirements.find({"importer_id": profile['id']}, {"_id": 0}).to_list(1000)
    return requirements


@api_router.get("/importers/quotations/{requirement_id}", response_model=List[Bid])
async def get_requirement_quotations(requirement_id: str, current_user: dict = Depends(get_current_user)):
    bids = await db.bids.find({"requirement_id": requirement_id}, {"_id": 0}).to_list(1000)
    return bids


@api_router.post("/importers/orders")
async def contract_order(requirement_id: str, bid_id: str, current_user: dict = Depends(get_current_user)):
    profile = await db.importer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    bid = await db.bids.find_one({"id": bid_id}, {"_id": 0})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    order = Order(
        requirement_id=requirement_id,
        importer_id=profile['id'],
        manufacturer_id=bid['manufacturer_id'],
        bid_id=bid_id
    )
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.orders.insert_one(doc)
    
    # Update requirement status
    await db.requirements.update_one({"id": requirement_id}, {"$set": {"status": "contracted"}})
    # Update bid status
    await db.bids.update_one({"id": bid_id}, {"$set": {"status": "accepted"}})
    
    return order.model_dump()


@api_router.get("/importers/orders", response_model=List[Order])
async def get_importer_orders(current_user: dict = Depends(get_current_user)):
    profile = await db.importer_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    if not profile:
        return []
    orders = await db.orders.find({"importer_id": profile['id']}, {"_id": 0}).to_list(1000)
    return orders


# ========== ADMIN ROUTES ==========
@api_router.get("/admin/requirements", response_model=List[Requirement])
async def admin_get_requirements(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    requirements = await db.requirements.find({}, {"_id": 0}).to_list(1000)
    return requirements


@api_router.put("/admin/requirements/{requirement_id}/status")
async def admin_update_requirement_status(requirement_id: str, request: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    status = request.get('status')
    await db.requirements.update_one({"id": requirement_id}, {"$set": {"status": status}})
    return {"message": "Requirement status updated"}


@api_router.get("/admin/bids", response_model=List[Bid])
async def admin_get_bids(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    bids = await db.bids.find({}, {"_id": 0}).to_list(1000)
    return bids


@api_router.get("/admin/orders", response_model=List[Order])
async def admin_get_orders(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return orders


@api_router.put("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    return {"message": "Order updated"}


@api_router.get("/admin/matching/{requirement_id}")
async def admin_get_matching_details(requirement_id: str, current_user: dict = Depends(get_current_user)):
    """
    Admin can view why manufacturers were matched (or not matched) to a requirement
    """
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    
    requirement = await db.requirements.find_one({"id": requirement_id}, {"_id": 0})
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    
    # Get all manufacturer products
    all_products = await db.products.find({}, {"_id": 0}).to_list(1000)
    
    # Get manufacturer profiles to include company names
    manufacturer_profiles = await db.manufacturer_profiles.find({}, {"_id": 0}).to_list(1000)
    profile_map = {p['id']: p for p in manufacturer_profiles}
    
    # Calculate matching for each manufacturer's products
    matching_results = []
    for product in all_products:
        match_indicator = calculate_match(product, requirement)
        manufacturer_profile = profile_map.get(product['manufacturer_id'])
        
        matching_results.append({
            "manufacturer_id": product['manufacturer_id'],
            "manufacturer_name": manufacturer_profile.get('company_name', 'Unknown') if manufacturer_profile else 'Unknown',
            "product_name": product['name'],
            "product_category": product.get('category', 'N/A'),
            "match_indicator": match_indicator.model_dump(),
            "is_matched": match_indicator.category_match and match_indicator.match_score >= 50
        })
    
    # Sort by match score
    matching_results.sort(key=lambda x: x['match_indicator']['match_score'], reverse=True)
    
    return {
        "requirement": requirement,
        "matching_results": matching_results
    }


# ========== FILE UPLOAD ROUTES ==========
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{current_user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type or "application/octet-stream")
    
    # Store reference in MongoDB
    file_doc = FileUpload(
        storage_path=result["path"],
        original_filename=file.filename,
        content_type=file.content_type,
        size=result["size"],
        uploaded_by=current_user['id']
    )
    doc = file_doc.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.files.insert_one(doc)
    
    return {"file_id": file_doc.id, "path": result["path"], "size": result["size"]}


@api_router.get("/files/{path:path}")
async def download_file(path: str, authorization: str = Header(None), auth: str = Query(None)):
    auth_header = authorization or (f"Bearer {auth}" if auth else None)
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


# ========== VESSEL TRACKING ROUTES ==========
@api_router.get("/vessels/track/{mmsi}")
async def track_vessel(mmsi: int, current_user: dict = Depends(get_current_user)):
    service = MarineTrafficService()
    position = await service.get_vessel_position(mmsi)
    if not position:
        raise HTTPException(status_code=404, detail="Vessel data not available")
    return position


# ========== AI TENDER ASSISTANT ROUTES ==========
class TenderAssistantInput(BaseModel):
    simple_requirement: str


class TenderAssistantOutput(BaseModel):
    product_name: str
    product_description: str
    category: str
    material: str
    packaging_requirements: str
    certifications: str
    quality_standards: str
    suggested_delivery_timeline: str
    hsn_code: str
    quantity: str
    quality_requirements: str
    port_details: str
    shipping_terms: str


@api_router.post("/ai/generate-tender", response_model=TenderAssistantOutput)
async def generate_tender_with_ai(input: TenderAssistantInput, current_user: dict = Depends(get_current_user)):
    """
    AI Tender Assistant - Generate structured tender requirements from simple text
    """
    try:
        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"tender-{current_user['id']}-{uuid.uuid4()}",
            system_message="""You are an expert procurement and international trade specialist. 
Your task is to convert simple product requirements into detailed, professional tender specifications 
suitable for B2B import/export transactions. Always provide realistic, industry-standard details."""
        ).with_model("openai", "gpt-5.2")
        
        # Create prompt for structured output
        prompt = f"""Based on this simple requirement: "{input.simple_requirement}"

Please generate a complete, professional tender specification in JSON format with the following fields:

{{
  "product_name": "Clear product name",
  "product_description": "Detailed 2-3 sentence description",
  "category": "Product category (e.g., Textiles, Electronics, Machinery, Food Products, Chemicals)",
  "material": "Primary materials/composition",
  "packaging_requirements": "Standard packaging specifications",
  "certifications": "Relevant industry certifications (e.g., ISO, CE, FDA)",
  "quality_standards": "Quality control and inspection requirements",
  "suggested_delivery_timeline": "Realistic delivery timeframe (e.g., 30-45 days)",
  "hsn_code": "Appropriate HSN/HS code",
  "quantity": "Quantity in appropriate units",
  "quality_requirements": "Specific quality parameters",
  "port_details": "Typical origin port for this product",
  "shipping_terms": "Suggested INCOTERM (FOB/CIF/CNF)"
}}

Respond ONLY with valid JSON, no additional text."""
        
        # Send message to AI
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        tender_data = json.loads(response)
        
        return TenderAssistantOutput(**tender_data)
        
    except Exception as e:
        logger.error(f"AI tender generation failed: {e}")
        # Fallback response if AI fails
        return TenderAssistantOutput(
            product_name=input.simple_requirement,
            product_description=f"Professional procurement requirement for {input.simple_requirement}",
            category="General",
            material="To be specified",
            packaging_requirements="Standard export packaging",
            certifications="Industry standard certifications required",
            quality_standards="As per international standards",
            suggested_delivery_timeline="30-45 days from order confirmation",
            hsn_code="To be determined",
            quantity="To be specified",
            quality_requirements="Meeting international quality standards",
            port_details="Major international port",
            shipping_terms="FOB"
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()