from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from ..config import settings

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = None):
    """
    Verify JWT token
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Token not provided")

    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(token: str = None):
    """
    Get current user from token
    """
    # TODO: Implement user retrieval from token
    return {"user_id": 1, "email": "user@example.com"}
