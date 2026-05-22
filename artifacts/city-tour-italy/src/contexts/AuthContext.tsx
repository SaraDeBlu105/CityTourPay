import React, { createContext, useContext, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("cti_token") : null;
  
  const { data: user, isLoading } = useGetMe({ 
    query: { 
      enabled: !!token, 
      queryKey: getGetMeQueryKey(),
      retry: false
    } 
  });

  const login = (newToken: string) => {
    localStorage.setItem("cti_token", newToken);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const logout = () => {
    localStorage.removeItem("cti_token");
    queryClient.setQueryData(getGetMeQueryKey(), null);
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
