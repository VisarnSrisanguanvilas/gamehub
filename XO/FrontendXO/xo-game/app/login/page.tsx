"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
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
import { getPayloadFromToken } from "@/lib/jwt"
import { toast } from "sonner"

export default function LoginCard() {
    const API = "http://127.0.0.1:8000"
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const PASSWORD_REGEX = /^.{6,}$/

    useEffect(() => {
        const payload = getPayloadFromToken()
        if (!payload) return

        router.push(payload.role === "admin" ? "/admin" : "/home")
    }, [router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!EMAIL_REGEX.test(email)) {
            setError("รูปแบบอีเมลไม่ถูกต้อง")
            return
        }
        if (!PASSWORD_REGEX.test(password)) {
            setError(
                "รหัสผ่านไม่ถูกต้อง"
            )
            return
        }
        setLoading(true)
        try {
            const res = await axios.post(API + "/login", {
                email,
                password,
            })
            if (res.data?.error) {
                setError(res.data.error)
                return
            }
            toast.success("Login Successful", {
                description: "เข้าสู่ระบบสำเร็จ",
            })
            const token = res.data.access_token
            localStorage.setItem("token", token)
            axios.defaults.headers.common["Authorization"] = token
            const payload = getPayloadFromToken()
            if (!payload) throw new Error("Invalid token")

            router.push(payload.role === "admin" ? "/admin" : "/home")
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Login failed")

            } else {
                setError("Login failed")
                toast.error("Login failed", {
                    description: error,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-sky-100 to-purple-100 p-4">
            <Card className="w-full max-w-sm border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl rounded-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-black">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-sm text-black">
                        Sign in to continue to your account
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="link"
                            onClick={() => router.push("/singin")}
                            className="px-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        >
                            Sign Up
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form className="space-y-5" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-black">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                className="h-11 rounded-xl"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-black">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                className="h-11 rounded-xl"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:opacity-90 transition cursor-pointer"
                        >
                            {loading ? "Loading..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter />
            </Card>
        </div>
    )
}
