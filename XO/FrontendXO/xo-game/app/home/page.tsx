"use client"

import { useEffect, useState } from "react"
import { ChevronDown, CirclePlus, CircleX, Eye, LogOut, Play } from 'lucide-react';
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getPayloadFromToken } from "@/lib/jwt"
import { Room, TokenPayload } from "../types/types"
import { toast } from "sonner"

const getPlayedMinutes = (start: string, end: string | null) => {
  if (!end) return "-"
  const diffSec =
    (new Date(end).getTime() - new Date(start).getTime()) / 1000 //<- แปลงเป็นวินาที
  const m = Math.floor(diffSec / 60)
  const s = Math.floor(diffSec % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function HomePage() {
  const router = useRouter()
  const API_URL = "http://127.0.0.1:8000"
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomSize, setRoomSize] = useState("3")
  const [loading, setLoading] = useState(false)
  const [payload, setPayload] = useState<TokenPayload | null>(null)

  useEffect(() => {
    const fetchMyRooms = async () => {
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

        setPayload(payload)

        const token = localStorage.getItem("token")
        if (!token) return

        const res = await axios.get(`${API_URL}/xos/my`, {
          headers: { Authorization: token },
        })

        setRooms(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error(error)
        localStorage.removeItem("token")
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchMyRooms()
  }, [router])


  const handleCreateRoom = async () => {
    const token = localStorage.getItem("token")
    if (!token) return router.push("/login")

    setLoading(true)
    try {
      const res = await axios.post(
        `${API_URL}/xos/create-game`,
        { board_size: Number(roomSize) },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      router.push(`/game?xo_id=${res.data.id}&size=${res.data.board_size}`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (xoId: number) => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      await axios.delete(`${API_URL}/xos/${xoId}`, {
        headers: {
          Authorization: token,
        },
      })
      toast.success("Delete game successful", {
        description: "ลบเกมสำเร็จ",
      })
      setRooms((prev) => prev.filter((r) => r.id !== xoId))
    } catch (err) {
      console.error("Delete room failed", err)
    }
  }

  if (!payload || loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100">
      <div className="mx-auto max-w-5xl space-y-8">

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              XO Game
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                relative flex h-10 w-10 items-center justify-center
                rounded-full bg-slate-500 text-sm font-semibold text-white
                ring-2 ring-white/60 shadow-sm
              hover:ring-white/80 transition
                cursor-pointer
              "
              >
                {payload.email[0].toUpperCase()}
                <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 bg-slate-700 rounded-full p-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{payload.email}</p>
                <p className="text-xs text-muted-foreground">
                  {payload.role}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("token")
                  delete axios.defaults.headers.common["Authorization"]
                  router.push("/login")
                }}
              >
                Logout <LogOut className="text-red-500" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Card className="border-white/60 bg-white/80 backdrop-blur-xl shadow-sm">
          <CardHeader>
            <CardTitle>Create a new room</CardTitle>
            <CardDescription>
              Choose board size and start playing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-linear-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:opacity-90 transition">
                  <CirclePlus />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Room</DialogTitle>
                  <DialogDescription>
                    Select board size
                  </DialogDescription>
                </DialogHeader>
                <Select value={roomSize} onValueChange={setRoomSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 x 3</SelectItem>
                    <SelectItem value="4">4 x 4</SelectItem>
                    <SelectItem value="5">5 x 5</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="mt-4 w-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:opacity-90 transition"
                >
                  {loading ? "Creating..." : "Start"}
                </Button>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Rooms & History
          </h2>
          <p className="text-sm text-slate-500">
            All your active and finished games
          </p>
        </div>
        {rooms.length === 0 ? (
          <Card className="border-dashed bg-white/60 backdrop-blur">
            <CardContent className="py-12 text-center text-sm text-slate-500">
              You have no rooms yet. Create one to start playing.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room, index) => {
              const status = room.end_time ? "finished" : "in-progress"

              return (
                <Card
                  key={room.id}
                  className="
                   border-white/40 bg-white/70 backdrop-blur-xl
                    transition-all duration-200 ease-out
                    hover:shadow-lg hover:-translate-y-0.5
                    "
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        Room {rooms.length - index} ({room.board_size}x{room.board_size})
                      </CardTitle>

                      {status === "in-progress" && (
                        <Badge
                          variant="outline"
                          className="border-amber-400/70 text-amber-600 text-xs"
                        >
                          In progress
                        </Badge>
                      )}

                      {status === "finished" && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/70 text-emerald-600 text-xs"
                        >
                          Finished
                        </Badge>
                      )}
                    </div>

                    <CardDescription>
                      Winner: {room.winner ?? "-"}
                    </CardDescription>

                    <CardDescription>
                      Duration:{" "}
                      {getPlayedMinutes(room.start_time, room.end_time)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex justify-between items-center">
                    <Button
                      variant={room.end_time ? "outline" : "default"}
                      className={
                        room.end_time
                          ? "border-slate-300 cursor-pointer"
                          : "bg-sky-400 hover:bg-slate-600 cursor-pointer"
                      }
                      onClick={() =>
                        router.push(
                          `/game?xo_id=${room.id}&size=${room.board_size}`
                        )
                      }
                    >
                      {room.end_time ? "View" : "Continue"}
                      {room.end_time ? <Eye /> : <Play />}
                    </Button>

                    {room.end_time && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <CircleX />
                            Delete
                          </Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Room</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this room?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline" className="cursor-pointer">
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}