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

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const { login } = useAuth();

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

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Required', 'Please enter both email and password');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert(
                'Sign In Failed',
                error.response?.data?.message || 'Invalid credentials. Please try again.'
            );
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

                {/* Logo and Branding */}
                <Animated.View style={[styles.header, animatedStyle]}>
                    <LottieView style={{ width: 200, height: 200, marginTop: 80 }} source={require('../../../loginAnimation.json')} autoPlay loop />
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </Animated.View>

                {/* Login Form */}
                <Animated.View style={[styles.formContainer, animatedStyle]}>
                    <View style={styles.formCard}>
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
                                    placeholder="you@example.com"
                                    placeholderTextColor="#94A3B8"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                    autoComplete="email"
                                    textContentType="emailAddress"
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
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                    autoComplete="password"
                                    textContentType="password"
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

                        {/* Forgot Password Link */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={[
                                styles.signInButton,
                                (!email || !password) && styles.signInButtonDisabled
                            ]}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.signInButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with Accounts</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Sign In */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={20} color="#DB4437" />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={20} color="#000000" />
                                <Text style={styles.socialButtonText}>Apple</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signUpLink}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Footer */}

            </KeyboardAvoidingView>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 10,
        paddingBottom: 20
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
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
        marginBottom: 32,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
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
        marginBottom: 20,
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
        paddingVertical: 16,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: 4,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '500',
    },
    signInButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    signInButtonDisabled: {
        backgroundColor: '#94A3B8',
        opacity: 0.7,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    socialButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    signUpText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '400',
    },
    signUpLink: {
        fontSize: 15,
        color: '#2563EB',
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 13,
        color: '#94A3B8',
        lineHeight: 18,
        fontWeight: '400',
    },
    footerLink: {
        color: '#2563EB',
        fontWeight: '500',
    },
});