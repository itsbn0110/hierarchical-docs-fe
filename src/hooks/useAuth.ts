import { useAuthContext } from "./useAuthContext";

export const useAuth = () => {
  const { user, ...ctx } = useAuthContext();
  // Role helpers for single role (string)
  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roleList: string[]) => roleList.includes(user?.role || "");
  return { user, ...ctx, hasRole, hasAnyRole };
};
