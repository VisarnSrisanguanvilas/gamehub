from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserStats(BaseModel):
    user_id: int
    email: str
    x_win: int
    o_win: int
    draw: int
    total: int