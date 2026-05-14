"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPayloadFromToken } from "@/lib/jwt"
import { GameState } from "../types/types"

export default function GamePage() {
  const router = useRouter()
  const API_URL = "http://127.0.0.1:8000"
  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const size = Number(searchParams.get("size") ?? 3)
  const xoId = searchParams.get("xo_id")

  useEffect(() => {
  const fetchGame = async () => {
    try {
      const payload = getPayloadFromToken()

      if (!payload) {
        router.push("/login")
        return
      }

      if (payload.role !== "user") {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        router.push("/login")
        return
      }

      const token = localStorage.getItem("token")

      const res = await axios.get(`${API_URL}/xos/${xoId}`, {
        headers: { Authorization: token },
      })

      setGame({
        ...res.data,
        board: JSON.parse(res.data.board),
      })
    } catch (error) {
      console.error(error)
      router.push("/home")
    } finally{
      setLoading(false)
    }
  }

  if (xoId) {
    fetchGame()
  }
}, [xoId, router])


  const handleClick = async (row: number, col: number) => {
    if (!xoId || !game || game.winner || loading) return
    if (game.board[row][col]) return

    const token = localStorage.getItem("token")
    if (!token) return

    setLoading(true)
    try {
      const res = await axios.patch(
        `${API_URL}/xos/${xoId}/move`,
        { row, col },
        { headers: { Authorization: token } }
      )

      setGame({
        ...res.data,
        board: JSON.parse(res.data.board),
      })
    } catch (error) { 
      console.error("Internal Server Error", error)
      router.push("/home")
    }
    finally {
      setLoading(false)
    }
  }

  if (!xoId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Missing xo_id
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => router.push("/home")}
        className="
          fixed left-4 top-4 z-50
          flex items-center gap-2
          text-slate-700 hover:text-slate-900
        "
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      <div className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100">
        <Card className="w-full max-w-lg border-white/40 bg-white/70 backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              XO Game
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Board size {size} x {size}
            </p>
            {game.winner ? (
              <Badge variant="secondary" className="mx-auto text-base">
                {game.winner === "draw"
                  ? "Game ended in a draw"
                  : `Winner: ${game.winner}`}
              </Badge>  
            ) : (
              <Badge
                variant="outline"
                className="mx-auto border-slate-400 text-slate-700"
              >
                Turn: {game.current_turn}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className="mx-auto grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {game.board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    disabled={!!cell || loading || !!game.winner}
                    onClick={() => handleClick(r, c)}
                    className="
                      aspect-square rounded-xl border border-slate-300
                      bg-white text-3xl font-semibold text-slate-900
                      transition hover:bg-slate-100
                      disabled:cursor-not-allowed
                      disabled:text-slate-400 cursor-pointer
                    "
                  >
                    {cell}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={game.winner !== null}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {game.winner === "draw" ? "Game Over" : "Match Finished"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-2xl text-slate-700">
            {game.winner === "draw"
              ? `DRAW !`
              : `Congratulations!`}
          </p>

          <p className="text-lg text-slate-700">
            {game.winner === "draw"
              ? `There is no winner in this match.`
              : `Winner: ${game.winner}`}
          </p>

          <Button
            className="mt-4 bg-slate-900 hover:bg-slate-800"
            onClick={() => router.push("/home")}
          >
            Return to Home
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
