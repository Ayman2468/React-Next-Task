const SESSION_KEY = "session";
export const setSession = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
};
export const getSession = () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
};
export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};
