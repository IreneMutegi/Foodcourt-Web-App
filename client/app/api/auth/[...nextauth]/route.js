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
          

          for (const table of tables) {
            const res = await fetch(`https://foodcourt-web-app-4.onrender.com/${table}/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });
            const apiResponse = await res.json()

            if (res.ok && apiResponse.user) {  // ✅ Ensure res.ok is checked correctly
              user = { ...apiResponse.user, role: table }; // ✅ Add role directly
              break;
            }
          }

          if (!user) {
            throw new Error("Invalid email or password");
          }

          return { id: user.id, email: user.email, role: user.role, name: user.name };
        } catch {
          throw new Error("Invalid email or password");
        }
      },  // ✅ This closing bracket was missing
    }),  // ✅ This was misaligned in your code
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
