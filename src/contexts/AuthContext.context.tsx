import React from "react";
import type { User } from "../types/app.types";
import type { LoginData } from "./AuthContext";

export interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  login: (loginData:LoginData ) => void;
}

export const AuthContext = React.createContext<AuthContextProps | undefined>(undefined);
