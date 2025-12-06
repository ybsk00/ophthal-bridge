import NextAuth from "next-auth"
import NaverProvider from "next-auth/providers/naver"

const handler = NextAuth({
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        }
    },
    debug: true, // Enable debug logs for Vercel
    secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
