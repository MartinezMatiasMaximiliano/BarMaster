import { useCallback, useEffect, useState } from 'react';

const THEME_COOKIE_NAME = 'barmaster_index_theme';
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const LIGHT_MODE = 'light';
const DARK_MODE = 'dark';

const readThemeCookie = () => {
    if (typeof document === 'undefined') return LIGHT_MODE;

    const themeCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(`${THEME_COOKIE_NAME}=`));
    const savedMode = themeCookie?.split('=')[1];

    return savedMode === DARK_MODE ? DARK_MODE : LIGHT_MODE;
};

const saveThemeCookie = (mode) => {
    document.cookie = `${THEME_COOKIE_NAME}=${mode}; Max-Age=${THEME_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
};

export const useIndexTheme = () => {
    const [themeMode, setThemeMode] = useState(readThemeCookie);

    useEffect(() => {
        saveThemeCookie(themeMode);
    }, [themeMode]);

    const toggleThemeMode = useCallback(() => {
        setThemeMode((currentMode) => currentMode === DARK_MODE ? LIGHT_MODE : DARK_MODE);
    }, []);

    return { themeMode, toggleThemeMode };
};
