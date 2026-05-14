import json
from fastapi import APIRouter, Depends, HTTPException,Request
from sqlmodel import Session, select
from datetime import datetime
from models.xo_model import Xo, BoardSize, PlayerEnum, Winner
from schemas.xo_schema import XoCreate, XoRead, XoMove
from configs.db import get_session
from utils.token import decode_token

router = APIRouter(prefix="/xos", tags=["XO Game"])

@router.get("/my", response_model=list[XoRead])
def get_my_games(request: Request, session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")

    stmt = (
        select(Xo)
        .where(Xo.user_id == int(user["user_id"]))
        .order_by(Xo.start_time.desc())
    )

    return session.exec(stmt).all()

#create game /home
@router.post("/create-game", response_model=XoRead)
def create_xo_game(payload: XoCreate,request: Request,session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")
    
    size = payload.board_size
    empty_board = [[None for _ in range(size)] for _ in range(size)]

    xo = Xo(
        board_size=BoardSize(size),
        #object array to json str
        board=json.dumps(empty_board),
        current_turn=PlayerEnum.X,
        user_id=int(user["user_id"]),
    )

    session.add(xo)
    session.commit()
    session.refresh(xo)

    return xo

#delete game /home
@router.delete("/{xo_id}")
def delete_xo_game(xo_id: int,request: Request, session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")
    
    
    xo = session.get(Xo, xo_id)

    if not xo:
        raise HTTPException(404, "Game not found")

    if xo.user_id != int(user["user_id"]):
        raise HTTPException(403, "Not your game")

    if not xo.end_time:
        raise HTTPException(400, "Cannot delete unfinished game")

    session.delete(xo)
    session.commit()

    return {"message": "Game deleted"}

#get room game by id xo /game
@router.get("/{xo_id}", response_model=XoRead)
def get_xo_by_id(xo_id: int, request: Request,session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")
    
    xo = session.get(Xo, xo_id)

    if not xo:
        raise HTTPException(404, "Game not found")

    if xo.user_id != int(user["user_id"]):
        raise HTTPException(403, "Not your game")

    return xo

#function check win
def check_winner(board, player):
    size = len(board)

    #นอน
    for i in range(size):
        if all(cell == player for cell in board[i]):
            return True
    # ตั้ง
    for j in range(size):
        if all(row[j] == player for row in board):
            return True
    # แทยงซ้ายไปขวา
    if all(board[i][i] == player for i in range(size)):
        return True
    # แทยงขวาไปซ้าย
    if all(board[i][size - 1 - i] == player for i in range(size)):
        return True

    return False

#move path /game
@router.patch("/{xo_id}/move", response_model=XoRead)
def make_move(xo_id: int,request:Request, payload: XoMove, session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = decode_token(token)
    if user.get("role") != "user":
        raise HTTPException(status_code=403, detail="User only")
    
    xo = session.get(Xo, xo_id)

    if not xo:
        raise HTTPException(404, "Game not found")

    if xo.user_id != int(user["user_id"]):
        raise HTTPException(403, "Not your game")

    if xo.winner:
        raise HTTPException(400, "Game finished")
    
    #Json string => object array
    board = json.loads(xo.board)

    if board[payload.row][payload.col] is not None:
        raise HTTPException(400, "Invalid move")

    player = xo.current_turn.value
    board[payload.row][payload.col] = player

    if check_winner(board, player):
        xo.winner = Winner(player)
        xo.end_time = datetime.utcnow()
        #ทุก row ใน board ทุก cell ใน row
    elif all(cell for row in board for cell in row):
        xo.winner = Winner.draw
        xo.end_time = datetime.utcnow()
    else:
        xo.current_turn = (
            PlayerEnum.O if xo.current_turn == PlayerEnum.X else PlayerEnum.X
        )

    xo.board = json.dumps(board)
    session.commit()
    session.refresh(xo)

    return xo

# def find_winning_move(board, player):
#     size = len(board)
#     for r in range(size):
#         for c in range(size):
#             if board[r][c] is None:
#                 board[r][c] = player
#                 if check_winner(board, player):
#                     board[r][c] = None
#                     return r, c
#                 board[r][c] = None
#     return None


# def bot_move(board):
#     size = len(board)

#     # 1. BOT ชนะได้ไหม
#     move = find_winning_move(board, PlayerEnum.O.value)
#     if move:
#         return move

#     # 2. ต้องกันผู้เล่นไหม
#     move = find_winning_move(board, PlayerEnum.X.value)
#     if move:
#         return move

#     # 3. ลงกลาง (ถ้าเป็น 3x3)
#     center = size // 2
#     if board[center][center] is None:
#         return center, center

#     # 4. ลงมุม
#     corners = [
#         (0, 0), (0, size - 1),
#         (size - 1, 0), (size - 1, size - 1)
#     ]
#     for r, c in corners:
#         if board[r][c] is None:
#             return r, c

#     # 5. ค่อยลงช่องว่างอื่น
#     for r in range(size):
#         for c in range(size):
#             if board[r][c] is None:
#                 return r, c

#     return None



#     if check_winner(board, player):
#         xo.winner = Winner(player)
#         xo.end_time = datetime.utcnow()

#     # draw
#     elif all(cell for row in board for cell in row):
#         xo.winner = Winner.draw
#         xo.end_time = datetime.utcnow()

#     else:
#     # เปลี่ยนเป็น BOT
#         xo.current_turn = PlayerEnum.O

#     # === BOT TURN ===
#     move = bot_move(board)
#     if move:
#         r, c = move
#         board[r][c] = PlayerEnum.O.value

#         if check_winner(board, PlayerEnum.O.value):
#             xo.winner = Winner.O
#             xo.end_time = datetime.utcnow()
#         elif all(cell for row in board for cell in row):
#             xo.winner = Winner.draw
#             xo.end_time = datetime.utcnow()
#         else:
#             xo.current_turn = PlayerEnum.X
