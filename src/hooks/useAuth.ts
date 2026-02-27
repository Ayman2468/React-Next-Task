import { getSession, setSession, clearSession } from "../utils/storage";

export const useAuth = () => {
  const login = (data: { email: string }) => {
    const fakeToken = "mock-token-123";

    setSession({
      user: data.email,
      token: fakeToken,
    });
  };

  const logout = () => {
    clearSession();
  };

  const isAuthenticated = () => {
    return !!getSession();
  };

  return { login, logout, isAuthenticated };
};