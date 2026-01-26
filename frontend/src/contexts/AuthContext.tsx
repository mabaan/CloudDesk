import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  fetchAuthSession,
  signIn,
  signOut
} from "aws-amplify/auth";

type Role = "user" | "agent";

type AuthUser = {
  username: string;
  role: Role;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    try {
      const cognitoUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const groups =
        session.tokens?.accessToken?.payload["cognito:groups"] ?? [];

      const role: Role =
        Array.isArray(groups) && groups.includes("Agents") ? "agent" : "user";

      setUser({
        username: cognitoUser.username,
        role
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      await signIn({
        username: email,
        password
      });

      await loadUser();
    } 
    catch (e) {
    console.log("SIGNIN_ERROR", e);
    throw e;
    }
    finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
