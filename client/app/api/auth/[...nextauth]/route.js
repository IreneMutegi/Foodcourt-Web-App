import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
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
          let userRole = null;

          for (const table of tables) {
            const res = await fetch(`http://localhost:5555/${table}/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });

            if (res.ok) {
              const userData = await res.json();
              if (userData.user) {
                user = userData.user;
                userRole = table;
                break;
              }
            }
          }

          if (!user) {
            throw new Error("Invalid email or password");
          }

          return { id: user.id, email: user.email, role: userRole };
        } catch (error) {
          throw new Error("Invalid email or password");
        }
      },  // ✅ This closing bracket was missing
    }),  // ✅ This was misaligned in your code
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
