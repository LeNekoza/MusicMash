import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/authOptions"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (session.error) {
    return Response.json({ error: "Token error" }, { status: 401 })
  }

  try {
    
    const response = await fetch("https://api.spotify.com/v1/me/top/tracks", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      return Response.json({ 
        error: "Failed to fetch top tracks",
        status: response.status 
      }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching top tracks:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
} 