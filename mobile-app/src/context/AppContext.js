import React, { createContext, useContext, useState, useCallback } from 'react';

// -----------------------------------------------------------------------
// AppContext
//
// Holds two pieces of global state:
//   1. `mode`  - 'vulnerable' | 'safe'  -> sent as X-Mode header on every API call
//   2. `auth`  - { token, user } or null
//
// The mode toggle is the top-left switch on every screen (see
// components/ModeToggle.js). Flipping it changes how the SAME backend
// endpoints behave (see backend/server.js):
//
//   vulnerable mode:
//     - SQL injection possible in login
//     - IDOR on profile (view any user's profile)
//     - predictable sequential session tokens
//     - MD5 password hashing
//     - stored XSS via unsanitized comments
//
//   safe mode:
//     - parameterized queries
//     - profile ownership enforced
//     - random session tokens
//     - bcrypt password hashing
//     - comments HTML-escaped
// -----------------------------------------------------------------------

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [mode, setMode] = useState('vulnerable'); // default for the pentest demo
    const [auth, setAuth] = useState(null); // { token, user }

    const toggleMode = useCallback(() => {
        setMode((m) => (m === 'vulnerable' ? 'safe' : 'vulnerable'));
    }, []);

    const login = useCallback((token, user) => {
        setAuth({ token, user });
    }, []);

    const logout = useCallback(() => {
        setAuth(null);
    }, []);

    return (
        <AppContext.Provider value={{ mode, toggleMode, auth, login, logout }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
