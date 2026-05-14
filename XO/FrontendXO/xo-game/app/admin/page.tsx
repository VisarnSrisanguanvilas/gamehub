"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { UserStats, TokenPayload } from "../types/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getPayloadFromToken } from "@/lib/jwt"
import { ChevronDown, LogOut } from "lucide-react"

export default function AdminPage() {
  const API_URL = "http://127.0.0.1:8000"
  const router = useRouter()
  const [users, setUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [payload] = useState<TokenPayload | null>(() =>
    typeof window !== "undefined" ? getPayloadFromToken() : null
  )

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      if (!payload) {
        router.push("/login")
        return
      }

      if (payload.role !== "admin") {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        router.push("/login")
        return
      }

      const token = localStorage.getItem("token")
      if (!token) return

      const res = await axios.get(`${API_URL}/users/all`, {
        headers: { Authorization: token },
      })

      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error(error)
      localStorage.removeItem("token")
      delete axios.defaults.headers.common["Authorization"]
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  fetchUsers()
}, [payload, router])

  if (loading || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              User Statistics
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of all users
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
                <div className="space-y-1">
                  <p className="text-sm font-medium">{payload.email}</p>
                  <Badge variant="secondary" className="text-xs">
                  {payload.role}
                  </Badge>
                </div>
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
        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">X</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">Draw</TableHead>
                <TableHead className="text-center">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, index) => (
                <TableRow
                  key={u.user_id}
                  className="hover:bg-muted/40 transition"
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{u.user_id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-center">{u.x_win}</TableCell>
                  <TableCell className="text-center">{u.o_win}</TableCell>
                  <TableCell className="text-center">{u.draw}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {u.total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
