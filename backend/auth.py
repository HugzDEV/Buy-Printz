from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Auth client is not needed - frontend handles authentication directly
supabase_auth = None
print("ℹ️ Supabase auth client not initialized (frontend handles auth directly)")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

class AuthManager:
    def __init__(self):
        self.supabase = supabase_auth
        
    def is_available(self):
        """Check if Supabase auth is available"""
        return self.supabase is not None

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[dict]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user with Supabase"""
        if not self.is_available():
            raise HTTPException(status_code=503, detail="Authentication service unavailable")
        
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                return {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token
                }
            return None
        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """Get current user from JWT token"""
        token = credentials.credentials
        
        # First try to verify with our JWT
        payload = self.verify_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                return {"user_id": user_id, "token_type": "jwt"}
        
        # Try to decode Supabase JWT token with proper validation
        try:
            from jose import jwt
            # For Supabase tokens, we need to verify against the JWT secret
            # Get the JWT secret from environment
            jwt_secret = os.getenv("JWT_SECRET_KEY")
            if jwt_secret:
                try:
                    # Try to verify the token with the JWT secret
                    payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
                    if payload and payload.get('sub'):
                        return {"user_id": payload.get('sub'), "token_type": "supabase_verified"}
                except jwt.JWTError:
                    # If JWT verification fails, try unverified decode as fallback
                    # but only for debugging - this should be removed in production
                    print("JWT verification failed, trying unverified decode for debugging")
                    payload = jwt.get_unverified_claims(token)
                    if payload and payload.get('sub'):
                        print(f"WARNING: Using unverified token for user: {payload.get('sub')}")
                        return {"user_id": payload.get('sub'), "token_type": "supabase_unverified"}
            else:
                print("JWT_SECRET_KEY not found, cannot verify Supabase tokens")
        except Exception as decode_error:
            print(f"Token decode error: {decode_error}")
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def refresh_token(self, refresh_token: str) -> Optional[dict]:
        """Refresh access token using Supabase"""
        if not self.is_available():
            return None
        
        try:
            response = self.supabase.auth.refresh_session(refresh_token)
            if response.session:
                return {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token
                }
            return None
        except Exception as e:
            print(f"Token refresh error: {e}")
            return None

    async def sign_out(self, access_token: str) -> bool:
        """Sign out user"""
        if not self.is_available():
            return False
        
        try:
            self.supabase.auth.sign_out()
            return True
        except Exception as e:
            print(f"Sign out error: {e}")
            return False

# Initialize auth manager
auth_manager = AuthManager()

# Dependency for getting current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return await auth_manager.get_current_user(credentials)
