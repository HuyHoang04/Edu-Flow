import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
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
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    // Exchange Google profile for Backend JWT
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
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
});
