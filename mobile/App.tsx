import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';
import AppTabs from './src/navigation/AppTabs';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
    const { userToken, isLoading: authLoading } = useAuth();
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null); // TS might infer null, let's fix logic or ignore if JS. Actually file is App.tsx. I should use generic.

    useEffect(() => {
        AsyncStorage.getItem('hasSeenOnboarding').then(value => {
            if (value === null) {
                setIsFirstLaunch(true);
            } else {
                setIsFirstLaunch(false);
            }
        });
    }, []);

    if (authLoading || isFirstLaunch === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isFirstLaunch && !userToken) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Onboarding">
                    {props => <OnboardingScreen {...props} onDone={() => setIsFirstLaunch(false)} />}
                </Stack.Screen>
            </Stack.Navigator>
        );
    }

    return (
        userToken ? <AppTabs /> : <AuthStack />
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthWrapper />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

import { DefaultTheme } from '@react-navigation/native';

const AuthWrapper = () => {
    const { theme } = useTheme();

    return (
        <AuthProvider>
            <NavigationContainer theme={{
                dark: theme.dark,
                colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.background,
                    card: theme.colors.card,
                    text: theme.colors.text,
                    border: theme.colors.border,
                    notification: theme.colors.danger,
                },
                fonts: DefaultTheme.fonts
            }}>
                <StatusBar style={theme.dark ? 'light' : 'dark'} />
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};
