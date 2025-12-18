import { NextAuthOptions } from "next-auth"
import NaverProvider from "next-auth/providers/naver"

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
            // 네이버 API는 profile endpoint에서 response 객체 안에 데이터가 있음
            profile(profile) {
                return {
                    id: profile.response.id,
                    name: profile.response.name,
                    email: profile.response.email,
                    image: profile.response.profile_image,
                }
            },
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

            // Default to /patient for Naver login if no other url is specified
            return `${baseUrl}/patient`
        },
        async jwt({ token, user, account, profile }) {
            // 최초 로그인 시 user 정보를 token에 저장
            if (user) {
                token.id = user.id  // 네이버 사용자 ID
                token.name = user.name
                token.email = user.email
                token.picture = user.image
            }
            // 네이버 프로필에서 직접 가져오기 (백업)
            if (profile && (profile as any).response) {
                const naverProfile = (profile as any).response
                token.id = naverProfile.id || token.id
                token.name = naverProfile.name || token.name
                token.email = naverProfile.email || token.email
                token.picture = naverProfile.profile_image || token.picture
            }
            return token
        },
        async session({ session, token }) {
            // token 정보를 session에 전달
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,  // 네이버 사용자 ID 추가
                    name: token.name as string,
                    email: token.email as string,
                    image: token.picture as string,
                }
            }
            return session
        },
        async signIn({ user, account, profile }) {
            console.log('NextAuth SignIn:', user.name, user.email, account?.provider)
            return true
        }
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET,
}
