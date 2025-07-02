import React from "react";
import type { User } from "../types/app.types";

export interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);
