from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel

class XoCreate(BaseModel):
    board_size: Literal[3, 4, 5]

class XoRead(BaseModel):
    id: int
    board_size: int
    current_turn: str                
    start_time: datetime
    end_time: Optional[datetime]
    winner: Optional[str]
    board: str

class XoMove(BaseModel):
    row: int
    col: int    
