import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Linking,
    Platform,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

import AttendanceProgress from '../../components/AttendanceProgress';
import FeesSummaryCard from '../../components/FeesSummaryCard';
import AttendanceHistoryList from '../../components/AttendanceHistoryList';

const StudentProfileScreen = ({ route, navigation }) => {
    const { studentId } = route.params || {};
    const targetId = studentId || route.params?.student?._id;

    // Theme
    const { theme } = useTheme();
    const { colors } = theme;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [studentData, setStudentData] = useState(null);

    /* 🔹 Animations */
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    const animateIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    const fetchStudentDetails = async () => {
        try {
            const res = await client.get(`/students/${targetId}/details`);
            setStudentData(res.data);
            animateIn();
        } catch (e) {
            Alert.alert('Error', 'Failed to fetch student details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStudentDetails();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudentDetails();
    };

    const handleCall = () => {
        if (!studentData?.student?.phone) return;
        const phone = studentData.student.phone;
        const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
        Linking.openURL(url);
    };

    if (loading) {
        return (
            <View style={[styles.loader, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const { student, attendance, fees, attendanceHistory } = studentData;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={theme.dark ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            {/* HEADER */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.iconButton, { backgroundColor: colors.card }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Student Profile</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('EditStudent', { student })}
                    style={[styles.iconButton, { backgroundColor: colors.card }]}
                >
                    <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                style={{ opacity: fadeAnim }}
            >
                {/* PROFILE CARD */}
                <View style={styles.profileSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                        <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
                        <Text style={[styles.batchInfo, { color: colors.textSecondary }]}>{student.batchName} • {student.batchTiming}</Text>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, student.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                                <Text style={[styles.statusText, student.status === 'active' ? styles.textActive : styles.textInactive]}>
                                    {student.status.toUpperCase()}
                                </Text>
                            </View>

                            {student.phone && (
                                <TouchableOpacity
                                    onPress={handleCall}
                                    style={[styles.phoneButton, { backgroundColor: theme.dark ? colors.primary + '30' : '#eef2ff' }]}
                                >
                                    <Ionicons name="call-outline" size={14} color={colors.primary} />
                                    <Text style={[styles.phoneText, { color: colors.primary }]}>Call</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* STATS OVERVIEW */}
                <View style={styles.statsContainer}>
                    <View style={[styles.attendanceCard, { backgroundColor: colors.card }]}>
                        <AttendanceProgress percentage={parseFloat(attendance.percentage)} size={80} />
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Attendance</Text>
                    </View>
                    <View style={styles.spacer} />
                    <View style={[styles.feesCard, { backgroundColor: colors.card }]}>
                        <FeesSummaryCard fees={fees} compact />
                    </View>
                </View>

                {/* HIGHLIGHTS GRID */}
                <View style={styles.grid}>
                    <HighlightItem
                        label="Total Classes"
                        value={attendance.totalClasses}
                        icon="calendar-outline"
                        color={colors.textSecondary}
                        bgColor={theme.dark ? colors.background : '#f1f5f9'}
                        colors={colors}
                    />
                    <HighlightItem
                        label="Present"
                        value={attendance.present}
                        icon="checkmark-circle-outline"
                        color={colors.success}
                        bgColor={theme.dark ? colors.success + '20' : '#dcfce7'}
                        colors={colors}
                    />
                    <HighlightItem
                        label="Absent"
                        value={attendance.absent}
                        icon="close-circle-outline"
                        color={colors.danger}
                        bgColor={theme.dark ? colors.danger + '20' : '#fee2e2'}
                        colors={colors}
                    />
                </View>

                {/* RECENT ACTIVITY / HISTORY */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Attendance History</Text>
                </View>
                <AttendanceHistoryList history={attendanceHistory} limit={5} />

                {/* FEE HISTORY SECTION */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee History</Text>
                </View>

                <View style={[styles.feeListCard, { backgroundColor: colors.card }]}>
                    {fees.history?.length ? (
                        fees.history.map((fee, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.feeRow,
                                    { borderBottomColor: colors.border },
                                    index === fees.history.length - 1 && styles.lastFeeRow
                                ]}
                            >
                                <View style={styles.feeInfo}>
                                    <View style={[styles.feeIconContainer, { backgroundColor: colors.background }]}>
                                        <MaterialCommunityIcons name="cash" size={20} color={colors.textSecondary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.feeMonth, { color: colors.text }]}>{fee.month}</Text>
                                        <Text style={[styles.feeDate, { color: colors.textSecondary }]}>
                                            {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'Pending'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.feeAmountContainer}>
                                    <Text style={[styles.feeAmount, { color: colors.text }]}>₹{fee.amount}</Text>
                                    <View style={[styles.feeStatusBadge, fee.status === 'paid' ? { backgroundColor: theme.dark ? colors.success + '30' : '#dcfce7' } : { backgroundColor: theme.dark ? colors.danger + '30' : '#fee2e2' }]}>
                                        <Text style={[styles.feeStatusText, fee.status === 'paid' ? { color: colors.success } : { color: colors.danger }]}>
                                            {fee.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fee records found</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const HighlightItem = ({ label, value, icon, color, bgColor, colors }) => (
    <View style={[styles.highlightCard, { backgroundColor: colors.card }]}>
        <View style={[styles.iconBox, { backgroundColor: bgColor || colors.background }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.highlightValue, { color }]}>{value}</Text>
        <Text style={[styles.highlightLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    iconButton: {
        padding: 8,
        borderRadius: 12,
        elevation: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    avatarContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    studentName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    batchInfo: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 10,
    },
    statusActive: { backgroundColor: '#dcfce7' },
    statusInactive: { backgroundColor: '#fee2e2' },
    statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    textActive: { color: '#15803d' },
    textInactive: { color: '#b91c1c' },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    phoneText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    attendanceCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    feesCard: {
        flex: 1.5,
        borderRadius: 24,
        padding: 4,
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
    },
    spacer: { width: 16 },
    statLabel: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    highlightCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    highlightValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    highlightLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    feeListCard: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    lastFeeRow: {
        borderBottomWidth: 0,
    },
    feeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    feeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    feeMonth: {
        fontSize: 15,
        fontWeight: '600',
    },
    feeDate: {
        fontSize: 12,
        marginTop: 1,
    },
    feeAmountContainer: {
        alignItems: 'flex-end',
    },
    feeAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    feeStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    feeStatusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontStyle: 'italic',
    },
});

export default StudentProfileScreen;
