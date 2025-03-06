import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const tables = ["admin", "client", "restaurant"];
          let user = null;

          for (const table of tables) {
            const res = await fetch(
              `https://foodcourt-web-app-4.onrender.com/${table}/login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: credentials.email,
                  password: credentials.password,
                }),
              }
            );

            const apiResponse = await res.json();
            if (res.ok && apiResponse.user) {
              user = { ...apiResponse.user, role: table };
              break;
            }
          }

          if (!user) {
            throw new Error("Invalid email or password");
          }

          return { id: user.id, email: user.email, role: user.role, name: user.name };
        } catch (error) {
          console.error("Invalid email or password", error);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name || "Guest";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.name = token.name || "Guest";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// ✅ Correct exports for Next.js App Router
export const GET = handler;
export const POST = handler;
