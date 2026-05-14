import { jwtDecode } from "jwt-decode"
import { TokenPayload } from "@/app/types/types"

export const getPayloadFromToken = (): TokenPayload | null => {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}
