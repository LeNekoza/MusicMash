/* eslint-disable @typescript-eslint/no-explicit-any */
import SpotifyProvider from "next-auth/providers/spotify"

/* const scopes = [
  "user-read-email",
  "user-read-private", 
  "user-top-read",
  "user-read-recently-played"
].join(" ") */

/* const params = {
  scope: scopes
} */

/* const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString() */

async function refreshAccessToken(token: any) {
  try {
    const url = "https://accounts.spotify.com/api/token"

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions = {
    providers: [
        SpotifyProvider({
          clientId: process.env.SPOTIFY_CLIENT_ID!,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
          authorization: {
            url: "https://accounts.spotify.com/authorize",
            params: {
              scope: [
                "user-read-email",
                "user-read-private",
                "user-top-read",
                "user-read-recently-played"
              ].join(" "),
            },
          },
        }),
      ],
  callbacks: {
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at! * 1000
        return token
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} 