import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Dynamically determine the IP address of the machine running the Expo server
// This works for physical devices (LAN) and emulators
const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:5000/api`;
    }

    // Fallback
    return 'http://10.0.2.2:5000/api';
};

const BASE_URL = getBaseUrl();

console.log('API Base URL:', BASE_URL);

const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
