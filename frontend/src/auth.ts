import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const apiUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
                    const response = await axios.post(
                        `${apiUrl}/auth/login-credentials`,
                        {
                            email: credentials.email,
                            password: credentials.password,
                        }
                    );

                    if (response.data && response.data.access_token) {
                        return {
                            ...response.data.user,
                            backendToken: response.data.access_token,
                            role: response.data.user.role,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Error signing in with credentials:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Exchange Google profile for Backend JWT
                    const apiUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
                    const response = await axios.post(
                        `${apiUrl}/auth/login`,
                        {
                            googleId: user.id,
                            email: user.email,
                            name: user.name,
                            avatarUrl: user.image,
                            accessToken: account.access_token,
                        }
                    );

                    if (response.data && response.data.access_token) {
                        // Store backend token in user object temporarily to pass to jwt callback
                        (user as any).backendToken = response.data.access_token;
                        (user as any).role = response.data.user.role;
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Error signing in with backend:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user && (user as any).backendToken) {
                token.accessToken = (user as any).backendToken;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.accessToken) {
                (session as any).accessToken = token.accessToken;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
});
