import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [loading, setLoading] = useState(false);

    // Professional subtle animations
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Required', 'Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            navigation.navigate('Login');
        } catch (e) {
            Alert.alert('Registration Failed', e.response?.data?.message || 'Try again');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View style={styles.container}>
            {/* Professional Background */}
            <View style={styles.background}>
                <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.wrapper}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Header */}
                    <Animated.View style={[styles.header, animatedStyle]}>
                        {/* Placeholder for animation or just use spacing if no specific animation */}
                        <LottieView
                            source={require('../../../signUp.json')}
                            autoPlay
                            loop
                            style={{ width: 400, height: 120, marginTop: 50 }}
                        />
                        <View style={{ height: 40 }} />
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View style={[styles.formContainer, animatedStyle]}>
                        <View style={styles.formCard}>

                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'name' && styles.inputFocused
                                ]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color={focusedInput === 'name' ? '#2563EB' : '#94A3B8'}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        value={name}
                                        onChangeText={setName}
                                        onFocus={() => setFocusedInput('name')}
                                        onBlur={() => setFocusedInput(null)}
                                        placeholder="John Doe"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'email' && styles.inputFocused
                                ]}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color={focusedInput === 'email' ? '#2563EB' : '#94A3B8'}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        value={email}
                                        onChangeText={setEmail}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        placeholder="you@example.com"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                        autoComplete="email"
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'password' && styles.inputFocused
                                ]}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={focusedInput === 'password' ? '#2563EB' : '#94A3B8'}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        secureTextEntry={!showPassword}
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                        autoComplete="password-new"
                                    />
                                    {password.length > 0 && (
                                        <TouchableOpacity
                                            onPress={togglePasswordVisibility}
                                            style={styles.eyeButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color="#64748B"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Confirm Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedInput === 'confirmPassword' && styles.inputFocused
                                ]}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color={focusedInput === 'confirmPassword' ? '#2563EB' : '#94A3B8'}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        onFocus={() => setFocusedInput('confirmPassword')}
                                        onBlur={() => setFocusedInput(null)}
                                        secureTextEntry={!showPassword} // Keeping same visibility toggle for both ideally, or simple secure
                                        placeholder="••••••••"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.input}
                                    />
                                </View>
                            </View>

                            {/* Register Button */}
                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading}
                                style={[
                                    styles.primaryButton,
                                    (!name || !email || !password || !confirmPassword) && styles.primaryButtonDisabled
                                ]}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                        </View>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    wrapper: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '400',
    },
    formContainer: {
        marginBottom: 24,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24, // Slightly less padding than login to fit more fields
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16, // Slightly reduced spacing
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14, // Slightly reduced vertical padding
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    inputFocused: {
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '400',
        padding: 0,
    },
    eyeButton: {
        padding: 4,
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    primaryButtonDisabled: {
        backgroundColor: '#94A3B8',
        opacity: 0.7,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    loginText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '400',
    },
    loginLink: {
        fontSize: 15,
        color: '#2563EB',
        fontWeight: '600',
    },
});
