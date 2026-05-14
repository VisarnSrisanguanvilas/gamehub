"use client"

import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^.{6,}$/

export default function RegisterCard() {
  const router = useRouter()
  const API = "http://127.0.0.1:8000"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!EMAIL_REGEX.test(email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง")
      return
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(
        "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
      )
      return
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }
    try {
      setLoading(true)

      await axios.post(API + "/user", {
        email,
        password,
      })

      toast.success("Signin Successful", {
        description: "สามารถเข้าสู่ระบบได้ทันที",
      })

      router.push("/login")
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.detail || "Signin failed"
        : "Signin failed"

      toast.error("สมัครสมาชิกไม่สำเร็จ", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100 p-4">
      <Card className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">
            Create account
          </CardTitle>
          <CardDescription className="text-sm text-black/70">
            Enter your information to create an account
          </CardDescription>
          <CardAction>
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="px-0 text-sm font-medium text-indigo-600 cursor-pointer"
            >
              Login
            </Button>
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-black">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                อย่างน้อย 6 ตัวอักษร
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-black">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </CardContent>

          <CardFooter className="mt-5">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:opacity-90 cursor-pointer"
            >
              {loading ? "Creating..." : "Create account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
