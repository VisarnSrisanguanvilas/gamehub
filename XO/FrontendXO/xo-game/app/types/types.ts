//admin
export type UserStats = {
  user_id: number
  email: string
  x_win: number
  o_win: number
  draw: number
  total: number
}

//home user
export type Room = {
  id: number
  board_size: number
  winner: "X" | "O" | "draw" | null
  start_time: string
  end_time: string | null
}

//game user
type Player = "X" | "O" | null
type Winner = "X" | "O" | "draw" | null

//Game state
export type GameState = {
  id: number
  board: Player[][]
  current_turn: "X" | "O"
  winner: Winner
}

//
export type TokenPayload = {
  email: string
  role: string
  user_id: string
}

