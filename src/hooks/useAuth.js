import { getSession, setSession, clearSession } from "../utils/storage.js";
export const useAuth = () => {
    const login = (data) => {
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
