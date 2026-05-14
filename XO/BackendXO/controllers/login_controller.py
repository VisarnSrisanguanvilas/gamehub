from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from models.user_model import User
from configs.db import get_session
from utils.token import create_token
from schemas.login_schema import LoginRequest


router = APIRouter(prefix="/login", tags=["Login"])

#login /login
@router.post("/")
def login(payload: LoginRequest,session: Session = Depends(get_session),):
    user = session.exec(select(User).where(User.email == payload.email)
    ).first()

    if not user:
        return{"error": "Invalid Email"}
    if user.password != payload.password:
        return {"error": "Invalid Password"}

    token = create_token({
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
    })

    return {
        "access_token": token
    }