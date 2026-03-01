import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../utils/colors';

const ThemeContext = createContext();
const STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();
    const [mode, setMode] = useState(null);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
            if (saved) setMode(saved);
        });
    }, []);

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        setMode(next);
        AsyncStorage.setItem(STORAGE_KEY, next);
    };

    const resetToSystem = () => {
        setMode(null);
        AsyncStorage.removeItem(STORAGE_KEY);
    };

    const isDark = mode ? mode === 'dark' : systemScheme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme, resetToSystem }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
