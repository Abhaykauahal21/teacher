import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        isLoggedIn();
    }, []);

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('token');
            let userInfo = await AsyncStorage.getItem('user');

            if (userToken) {
                setToken(userToken);
                setUser(JSON.parse(userInfo));
            }
            setIsLoading(false);
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            const res = await client.post('/auth/login', {
                email,
                password,
            });

            if (res.data) {
                setUser(res.data);
                setToken(res.data.token);
                AsyncStorage.setItem('user', JSON.stringify(res.data));
                AsyncStorage.setItem('token', res.data.token);
            }
            setIsLoading(false);
            return res.data;
        } catch (e) {
            setIsLoading(false);
            throw e;
        }
    };

    const register = async (name, email, password) => {
        try {
            setIsLoading(true);
            const res = await client.post('/auth/register', {
                name,
                email,
                password,
            });

            if (res.data) {
                setUser(res.data);
                setToken(res.data.token);
                AsyncStorage.setItem('user', JSON.stringify(res.data));
                AsyncStorage.setItem('token', res.data.token);
            }
            setIsLoading(false);
            return res.data;
        } catch (e) {
            setIsLoading(false);
            throw e;
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setIsLoading(false);
        } catch (e) {
            setIsLoading(false);
            console.log(`logout error ${e}`);
        }
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, isLoading, userToken: token, userInfo: user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}
