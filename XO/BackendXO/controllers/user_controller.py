from fastapi import Depends, APIRouter, HTTPException, Request
from sqlmodel import(Session, select)
from models.user_model import User
from configs.db import get_session
from schemas.user_schema import UserCreate
from schemas.user_schema import UserStats
from sqlalchemy import func, case
from models.xo_model import Xo, Winner
from utils.token import decode_token

router = APIRouter(tags=["Users"])

#signin /signin
@router.post("/user")
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    user = User(email=str(payload.email), password=str(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    return user

#user stats /admin
@router.get("/users/all", response_model=list[UserStats])
def get_all_user_stats(request:Request, session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    stmt = (
            select(
                User.id.label("user_id"),
                User.email.label("email"),

                func.sum(case((Xo.winner == Winner.X, 1), else_=0)).label("x_win"),
                func.sum(case((Xo.winner == Winner.O, 1), else_=0)).label("o_win"),
                func.sum(case((Xo.winner == Winner.draw, 1), else_=0)).label("draw"),

            func.count(Xo.id).label("total"),
        )
        .join(Xo, Xo.user_id == User.id,
              #เอาทุกคนแม้ไม่เคยเล่นเกมส์
               isouter=True)
        .where(User.role == "user")     
        .group_by(User.id)
        .order_by(User.id)
    )

    rows = session.exec(stmt).all()

    return [
        UserStats(
            user_id=r.user_id,
            email=r.email,
            x_win=r.x_win or 0,
            o_win=r.o_win or 0,
            draw=r.draw or 0,
            total=r.total or 0,
        )
        for r in rows
    ]
