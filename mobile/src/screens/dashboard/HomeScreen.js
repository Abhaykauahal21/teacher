import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInRight,
    ZoomIn
} from 'react-native-reanimated';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import EventCard from '../../components/EventCard';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { userInfo } = useAuth();
    const { theme } = useTheme();
    const { colors } = theme;

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await client.get('/dashboard');
            setStats(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const { totalBatches, totalStudents, financials } = stats || {};
    const { expected = 0, collected = 0, pending = 0 } = financials || {};

    const QuickAction = ({ icon, label, color, onPress, index }) => (
        <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[styles.quickActionItem, { backgroundColor: theme.dark ? '#1E293B' : '#fff' }]}
            >
                <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const StatBlock = ({ label, value, icon, color, onPress }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.statBlock, { backgroundColor: theme.dark ? '#1E293B' : '#fff' }]}
        >
            <View style={[styles.statHeader]}>
                <View style={[styles.miniIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                {/* Arrow Icon for clickable hint */}
                <Ionicons name="arrow-forward-outline" size={14} color={colors.textSecondary} />
            </View>
            <Text style={[styles.statBlockValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statBlockLabel, { color: colors.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <View>
                            <Text style={[styles.greeting, { color: colors.textSecondary }]}>  Welcome back,</Text>
                            <Text style={[styles.userName, { color: colors.text }]}> Hi, {userInfo?.name?.split(' ')[0]}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            style={[styles.profileButton, { borderColor: colors.border }]}
                        >
                            <Text style={[styles.profileInitials, { color: colors.text }]}>
                                {userInfo?.name?.charAt(0).toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lottie Animation Section */}
                    <View style={styles.lottieContainer}>
                        <LottieView
                            source={require('../../../Teacher.json')}
                            autoPlay
                            loop
                            style={{ width: 400, height: 400 }}
                        />
                    </View>

                    {/* Wallet Style Card */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.walletCardContainer}>
                        <LinearGradient
                            colors={['#101828', '#1e293b', '#0f172a']} // Dark Slate Theme
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.walletCard}
                        >
                            <View style={styles.walletHeader}>
                                <Text style={styles.walletLabel}>TOTAL STUDENTS</Text>
                                <View style={styles.liveIndicator}>
                                    <View style={styles.dot} />
                                    <Text style={styles.liveText}>Active</Text>
                                </View>
                            </View>

                            <Text style={styles.walletBalance}>{totalStudents || 0}</Text>

                            <View style={styles.walletFooter}>
                                <View>
                                    <Text style={styles.walletFooterLabel}>Active Batches</Text>
                                    <Text style={styles.walletFooterValue}>{totalBatches || 0}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Batches', { screen: 'SelectBatch' })}
                                    activeOpacity={0.8}
                                    style={styles.attendanceBtn}
                                >
                                    <Text style={styles.attendanceBtnText}>Take Attendance</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            {/* Decorative Circles */}
                            <View style={styles.decoCircle1} />
                            <View style={styles.decoCircle2} />
                        </LinearGradient>
                    </Animated.View>



                    {/* Financial Overview (Fintech Style) */}
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.sectionContainer]}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue This Month</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Fees')}>
                                <Text style={[styles.linkText, { color: colors.primary }]}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.financeBlock, { backgroundColor: theme.dark ? '#1E293B' : '#fff' }]}>
                            <View style={styles.financeMain}>
                                <View>
                                    <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Total Collected</Text>
                                    <Text style={[styles.financeBigValue, { color: colors.success }]}>₹{collected.toLocaleString()}</Text>
                                </View>
                                <View style={[styles.percentBadge, { backgroundColor: colors.success + '15' }]}>
                                    <Ionicons name="trending-up" size={14} color={colors.success} />
                                    <Text style={[styles.percentText, { color: colors.success }]}>
                                        {expected > 0 ? Math.round((collected / expected) * 100) : 0}%
                                    </Text>
                                </View>
                            </View>

                            {/* Custom Progress Bar */}
                            <View style={styles.progressBarWrapper}>
                                <View style={[styles.progressBarBase, { backgroundColor: theme.dark ? '#334155' : '#F1F5F9' }]}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${Math.min((collected / expected) * 100, 100)}%`,
                                                backgroundColor: colors.success
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            <View style={styles.financeGrid}>
                                <View>
                                    <Text style={[styles.financeGridLabel, { color: colors.textSecondary }]}>Expected</Text>
                                    <Text style={[styles.financeGridValue, { color: colors.text }]}>₹{expected.toLocaleString()}</Text>
                                </View>
                                <View style={styles.dividerVertical} />
                                <View>
                                    <Text style={[styles.financeGridLabel, { color: colors.textSecondary }]}>Pending</Text>
                                    <Text style={[styles.financeGridValue, { color: 'red' }]}>₹{pending.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Horizontal Quick Actions */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                    >
                        <EventCard
                            title="Happy Republic Day"
                            date="26th Jan"
                            type="republic-day"
                            index={0}
                        />
                        <QuickAction
                            index={3}
                            icon="settings"
                            label="Settings"
                            color="#64748B" // Slate
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </ScrollView>

                    {/* Grid Stats */}
                    <View style={styles.statsGrid}>
                        <StatBlock
                            label="Manage Batches"
                            value={totalBatches}
                            icon="layers"
                            color="#3B82F6"
                            onPress={() => navigation.navigate('Batches')}
                        />
                        <StatBlock
                            label="Student List"
                            value={totalStudents}
                            icon="people"
                            color="#10B981"
                            onPress={() => navigation.navigate('Batches')}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
    },
    userName: {
        fontSize: 30,
        fontWeight: '700',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInitials: {
        fontSize: 18,
        fontWeight: '600',
    },
    walletCardContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    walletCard: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        minHeight: 180,
        justifyContent: 'space-between',
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    walletLabel: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    liveText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '600',
    },
    walletBalance: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '700',
        marginVertical: 10,
    },
    walletFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    walletFooterLabel: {
        color: '#94a3b8',
        fontSize: 15,
        marginBottom: 4,
    },
    walletFooterValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    attendanceBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    attendanceBtnText: {
        color: '#0f172a',
        fontSize: 13,
        fontWeight: '700',
    },
    decoCircle1: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    decoCircle2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    linkText: {
        fontSize: 13,
        fontWeight: '600',
    },
    horizontalScroll: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    quickActionItem: {
        padding: 16,
        borderRadius: 20,
        width: 190,
        height: 110,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    sectionContainer: {
        marginTop: 10,
        marginBottom: 24,
    },
    financeBlock: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    financeMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    financeLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
    },
    financeBigValue: {
        fontSize: 28,
        fontWeight: '700',
    },
    percentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    percentText: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressBarWrapper: {
        marginBottom: 20,
    },
    progressBarBase: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    financeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerVertical: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0', // Light slate
        marginHorizontal: 24,
    },
    financeGridLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    financeGridValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    statsGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        gap: 16,
    },
    statBlock: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    miniIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statBlockValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statBlockLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    lottieContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        height: 150,
        width: '100%',
    },
    lottie: {
        width: 200,
        height: 150,
    },
});

export default HomeScreen;
