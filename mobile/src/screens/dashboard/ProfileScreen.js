import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Animated,
    ScrollView,
    Platform,
    Dimensions,
    SafeAreaView
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import soon from '../../components/CommingSoon';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { logout, userInfo } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { colors } = theme;

    const [stats, setStats] = useState({
        batches: 0,
        students: 0,
        collectionEfficiency: 0
    });

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const switchAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

    const fetchStats = async () => {
        try {
            const res = await client.get('/dashboard');
            const { totalBatches, totalStudents, financials } = res.data;
            const { expected = 0, collected = 0 } = financials || {};
            const efficiency = expected > 0 ? Math.round((collected / expected) * 100) : 0;

            setStats({
                batches: totalBatches || 0,
                students: totalStudents || 0,
                collectionEfficiency: efficiency
            });
        } catch (e) {
            console.log('Error fetching profile stats', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    useEffect(() => {
        // Entry animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideUpAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(avatarScale, {
                toValue: 1,
                tension: 60,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulsing effect for avatar
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleThemeToggle = () => {
        // Animate switch
        Animated.spring(switchAnim, {
            toValue: isDarkMode ? 0 : 1,
            tension: 150,
            friction: 10,
            useNativeDriver: false,
        }).start();
        toggleTheme();
    };

    const handleLogout = () => {
        // Exit animations before logout
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => logout());
    };

    // Menu items configuration
    const menuItems = [
        {
            id: 1,
            icon: 'person-outline',
            label: 'Edit Profile',
            label: 'Edit Profile',
            color: colors.primary,
            onPress: () => navigation.navigate('CommingSoon'),
        },
        {
            id: 2,
            icon: 'notifications-outline',
            label: 'Notifications',
            color: '#FF9500',
            badge: 3,
            onPress: () => navigation.navigate('CommingSoon'),
        },
        {
            id: 3,
            icon: 'shield-checkmark-outline',
            label: 'Privacy & Security',
            color: '#34C759',
            onPress: () => navigation.navigate('CommingSoon'),
        },
        {
            id: 4,
            icon: 'help-circle-outline',
            label: 'Help & Support',
            color: '#5856D6',
            onPress: () => navigation.navigate('CommingSoon'),
        },
        {
            id: 5,
            icon: 'information-circle-outline',
            label: 'About App',
            color: '#AF52DE',
            onPress: () => navigation.navigate('Onboarding'),
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Animated.ScrollView
                style={[styles.container, {
                    backgroundColor: colors.background,
                    opacity: fadeAnim,
                }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Background Gradient Blobs */}
                <View style={styles.backgroundContainer}>
                    <Svg height={height * 0.6} width={width} style={styles.blob}>
                        <Defs>
                            <RadialGradient
                                id="grad1"
                                cx="50%"
                                cy="50%"
                                rx="50%"
                                ry="50%"
                                fx="50%"
                                fy="50%"
                                gradientUnits="userSpaceOnUse"
                            >
                                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
                                <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Circle cx={width * 0.7} cy={height * 0.15} r={120} fill="url(#grad1)" />
                        <Circle cx={width * 0.3} cy={height * 0.1} r={80} fill="url(#grad1)" />
                    </Svg>
                </View>

                {/* Header */}
                <Animated.View style={[styles.header, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }]}>
                    {/* Profile Avatar with Gradient and Ring */}



                    <View style={styles.avatarContainer}>
                        <LottieView
                            style={{ width: 150, height: 150, borderRadius: 100, overflow: 'hidden', borderWidth: 5, borderColor: colors.primary, marginTop: -10, marginBottom: -30 }}
                            source={require('../../../avtar.json')}
                            autoPlay
                            loop
                        />
                    </View>

                    <Text style={[styles.name, { color: colors.text }]}>
                        {userInfo?.name}
                    </Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>
                        {userInfo?.email}
                    </Text>

                    {/* Role Badge */}
                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="school" size={14} color={colors.primary} />
                        <Text style={[styles.roleText, { color: colors.primary }]}>
                            Administrator
                        </Text>
                    </View>
                </Animated.View>

                {/* Stats Cards */}
                <Animated.View style={[styles.statsContainer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }]}>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="calendar" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.batches}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Batches</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#34C75915' }]}>
                            <Ionicons name="people" size={20} color="#34C759" />
                        </View>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.students}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Students</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#FF950015' }]}>
                            <Ionicons name="cash" size={20} color="#FF9500" />
                        </View>
                        <Text style={[styles.statNumber, { color: colors.text }]}>{stats.collectionEfficiency}%</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collection</Text>
                    </View>
                </Animated.View>

                {/* Menu Section */}
                <Animated.View style={[styles.menuContainer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Account Settings
                    </Text>

                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={{
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: slideUpAnim.interpolate({
                                        inputRange: [0, 30],
                                        outputRange: [0, 30 - (index * 10)]
                                    })
                                }]
                            }}
                        >
                            <TouchableOpacity
                                style={[styles.menuItem, { backgroundColor: colors.card }]}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuLeft}>
                                    <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                        <Ionicons name={item.icon} size={22} color={item.color} />
                                    </View>
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>
                                        {item.label}
                                    </Text>
                                </View>
                                <View style={styles.menuRight}>
                                    {item.badge && (
                                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.badgeText}>{item.badge}</Text>
                                        </View>
                                    )}
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Theme Toggle Card */}
                <Animated.View style={[styles.themeCard, {
                    backgroundColor: colors.card,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }]}>
                    <View style={styles.themeLeft}>
                        <View style={[styles.themeIcon, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons
                                name={isDarkMode ? "moon" : "sunny"}
                                size={24}
                                color={isDarkMode ? "#FFD700" : "#FF9500"}
                            />
                        </View>
                        <View>
                            <Text style={[styles.themeLabel, { color: colors.text }]}>
                                Dark Mode
                            </Text>
                            <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>
                                {isDarkMode ? 'Dark theme enabled' : 'Switch to dark theme'}
                            </Text>
                        </View>
                    </View>

                    <Animated.View style={{
                        transform: [{
                            translateX: switchAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 20]
                            })
                        }]
                    }}>
                        <Switch
                            value={isDarkMode}
                            onValueChange={handleThemeToggle}
                            trackColor={{ false: '#767577', true: colors.primary + '80' }}
                            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            style={styles.themeSwitch}
                        />
                    </Animated.View>
                </Animated.View>

                {/* Logout Button */}
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }}>
                    <TouchableOpacity
                        style={[styles.logoutButton, {
                            backgroundColor: isDarkMode ? '#FF3B3015' : '#FF3B30',
                            borderColor: isDarkMode ? '#FF3B3040' : '#FF3B30'
                        }]}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isDarkMode ?
                                ['#FF3B3040', '#FF3B3020'] :
                                ['#FF3B30', '#FF453A']
                            }
                            style={styles.logoutGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="log-out-outline" size={22} color={isDarkMode ? '#FF3B30' : '#FFF'} />
                            <Text style={[
                                styles.logoutText,
                                { color: isDarkMode ? '#FF3B30' : '#FFF' }
                            ]}>
                                Logout
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* Footer */}
                <Animated.View style={[styles.footer, {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideUpAnim }]
                }]}>
                    <Text style={[styles.version, { color: colors.textSecondary }]}>
                        Version 2.1.0
                    </Text>
                    <Text style={[styles.copyright, { color: colors.textSecondary }]}>
                        © 2024 EduManager Pro. All rights reserved.
                    </Text>
                </Animated.View>
            </Animated.ScrollView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },
    blob: {
        position: 'absolute',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 30,
        zIndex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarRing: {
        position: 'absolute',
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 2,
        top: -12,
        left: -12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    avatarGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        marginBottom: 12,
        opacity: 0.8,
        marginLeft: 35
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 30,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    menuContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    themeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    themeLabel: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    themeSubtitle: {
        fontSize: 14,
    },
    themeSwitch: {
        transform: Platform.OS === 'ios' ? [] : [{ scale: 1.1 }],
    },
    logoutButton: {
        marginHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    version: {
        fontSize: 14,
        marginBottom: 8,
    },
    copyright: {
        fontSize: 12,
        textAlign: 'center',
        opacity: 0.6,
    },
});

export default ProfileScreen;