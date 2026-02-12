import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

const LightTheme = {
    dark: false,
    colors: {
        background: '#f5f5f5',
        card: '#ffffff',
        text: '#333333',
        textSecondary: '#666666',
        primary: '#007AFF',
        primaryLight: '#4dabf5', // Added
        accent: '#f57c00', // Added
        border: '#eeeeee',
        inputBg: '#ffffff',
        statusBar: 'dark-content',
        success: '#2e7d32',
        danger: '#d32f2f',
        white: '#ffffff',
        iconBg: '#f0f0f0',
    }
};

const DarkTheme = {
    dark: true,
    colors: {
        background: '#121212',
        card: '#1e1e1e',
        text: '#f5f5f5',
        textSecondary: '#aaaaaa',
        primary: '#0a84ff',
        primaryLight: '#0056b3', // Added darker blue for gradient in dark mode? Or lighter? Linear Gradient usually needs distinct colors.
        // Actually, for dark mode gradient: ['#1a237e', '#283593'] was hardcoded in HomeScreen.
        // But for RefreshControl, it uses [colors.primary, colors.success, colors.accent].
        accent: '#ff9800', // Added
        border: '#333333',
        inputBg: '#2c2c2c',
        statusBar: 'light-content',
        success: '#66bb6a',
        danger: '#ef5350',
        white: '#ffffff',
        iconBg: '#333333',
    }
};

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                // Default to system preference
                setIsDarkMode(systemScheme === 'dark');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        try {
            await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
        } catch (e) {
            console.log(e);
        }
    };

    const theme = isDarkMode ? DarkTheme : LightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
