from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from enum import Enum
from models.user_model import User


class BoardSize(int, Enum):
    three = 3
    four = 4
    five = 5

class Winner(str, Enum):
    X = "X"
    O = "O"
    draw = "draw"


class PlayerEnum(str, Enum):
    X = "X"
    O = "O"


class Xo(SQLModel, table=True):
    __tablename__ = "xos"

    id: Optional[int] = Field(default=None, primary_key=True)
    board_size: BoardSize = Field(index=True)
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    board: str
    current_turn: PlayerEnum = Field(default=PlayerEnum.X)
    winner: Optional[Winner] = None

    user_id: int = Field(foreign_key="users.id", index=True)
    user: Optional[User] = Relationship(back_populates="xos")
