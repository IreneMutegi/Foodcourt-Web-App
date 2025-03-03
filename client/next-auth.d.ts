import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }

  interface User {
    id: number;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }

  interface JWT {
    id: number;
    email?: string | null;
    name?: string | null;
    role?: string;
  }
}
