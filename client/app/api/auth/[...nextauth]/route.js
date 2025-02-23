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
          const tables = ["admin", "client", "restaurants"];
          let user = null;
          let userRole = null;

          // Loop through each table to find the user
          for (const table of tables) {
            const res = await fetch(`http://localhost:3001/${table}?email=${credentials.email}`);
            const users = await res.json();

            if (users.length > 0) {
              user = users[0]; // Assuming unique emails
              userRole = table;
              break;
            }
          }

          if (!user) {
            throw new Error("User not found");
          }

          if (user.password !== credentials.password) {
            throw new Error("Invalid password");
          }

          return { id: user.id, email: user.email, role: userRole };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error("Invalid email or password");
        }
      },
    }),
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
