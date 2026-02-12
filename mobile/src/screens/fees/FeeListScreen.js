import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

const FeeListScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    // View State: 'dashboard' | 'details'
    const [viewMode, setViewMode] = useState('dashboard');
    const [selectedBatch, setSelectedBatch] = useState(null);

    // Data State
    const [batches, setBatches] = useState([]);
    const [allFees, setAllFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFees, setLoadingFees] = useState(false);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [months, setMonths] = useState([]);

    /* ---------------- INIT ---------------- */
    useEffect(() => {
        const m = [];
        for (let i = -5; i <= 1; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() + i);
            m.push(d.toISOString().slice(0, 7));
        }
        setMonths(m.reverse());
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            fetchAllFees();
        }
    }, [selectedMonth]);

    useFocusEffect(
        useCallback(() => {
            if (selectedMonth) {
                fetchAllFees();
            }
        }, [selectedMonth])
    );

    const fetchBatches = async () => {
        try {
            const res = await client.get('/batches');
            setBatches(res.data);
        } catch {
            Alert.alert('Error', 'Failed to load batches');
        }
    };

    const fetchAllFees = async () => {
        setLoadingFees(true);
        try {
            // Fetch fees for ALL batches for the selected month
            // We can query without batchId to get all, assuming backend supports it or filtering client side if needed.
            // Based on previous analysis, we might need to iterate or the backend needs to support batchId list.
            // Let's try fetching for all batches the user owns.
            // If backend `getFees` requires batchId, we might need slightly different logic, 
            // but the plan assumed fetching all. 
            // If backend handles "no batchId" as "all user's batches", we are good.
            // Looking at backend code: 
            // if (!batchId) query.batchId = { $in: batchIds }; -> THIS SUPPORT EXISTS!

            const res = await client.get(`/fees?month=${selectedMonth}`);
            setAllFees(res.data);
        } catch {
            // Alert.alert('Error', 'Failed to fetch fees');
        } finally {
            setLoadingFees(false);
        }
    };

    /* ---------------- UTILS ---------------- */
    const getBatchStats = (batchId) => {
        const batchFees = allFees.filter(f => f.batchId === batchId);
        const collected = batchFees.filter(f => f.status === 'paid')
            .reduce((sum, f) => sum + (f.amount || 0), 0);
        const pending = batchFees.filter(f => f.status === 'unpaid')
            .reduce((sum, f) => sum + (f.amount || 0), 0);
        const total = collected + pending;
        const count = batchFees.length;
        const paidCount = batchFees.filter(f => f.status === 'paid').length;

        // Progress
        const progress = total > 0 ? (collected / total) * 100 : 0;

        return { collected, pending, total, count, paidCount, progress };
    };

    /* ---------------- ACTIONS ---------------- */
    const handleBatchPress = (batch) => {
        setSelectedBatch(batch);
        setViewMode('details');
    };

    const handleBack = () => {
        setViewMode('dashboard');
        setSelectedBatch(null);
    };

    const toggleFeeStatus = async (item) => {
        const newStatus = item.status === 'paid' ? 'unpaid' : 'paid';
        try {
            await client.put(`/fees/${item._id}`, { status: newStatus });
            // Optimistic update or refetch
            fetchAllFees();
        } catch {
            Alert.alert('Error', 'Failed to update fee');
        }
    };

    const handleGenerateFees = () => {
        if (!selectedBatch) return;

        Alert.alert(
            'Generate Fees',
            `Generate fees for ${selectedBatch.batchName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Generate', onPress: generateFeesForBatch }
            ]
        );
    };

    const generateFeesForBatch = async () => {
        if (!selectedBatch) return;
        setLoading(true);
        try {
            const studentsRes = await client.get(`/students?batchId=${selectedBatch._id}`);

            let count = 0;
            await Promise.all(
                studentsRes.data.map(async (s) => {
                    try {
                        await client.post('/fees', {
                            studentId: s._id,
                            batchId: selectedBatch._id,
                            month: selectedMonth,
                            amount: selectedBatch.monthlyFee
                        });
                        count++;
                    } catch { } // Ignore duplicates
                })
            );

            Alert.alert('Success', `Fees generated for ${count} students`);
            fetchAllFees();
        } catch {
            Alert.alert('Error', 'Failed to generate fees');
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- RENDERERS ---------------- */

    // Dashboard Item
    const renderBatchCard = ({ item, index }) => {
        const stats = getBatchStats(item._id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    style={[styles.batchCard, { backgroundColor: colors.card }]}
                    onPress={() => handleBatchPress(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="people" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.batchName, { color: colors.text }]}>{item.batchName}</Text>
                            <Text style={[styles.batchSub, { color: colors.textSecondary }]}>
                                {item.classLevel} • {item.timing}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collected</Text>
                            <Text style={[styles.statValue, { color: colors.success }]}>₹{stats.collected}</Text>
                        </View>
                        <View style={[styles.statCol, { alignItems: 'flex-end' }]}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
                            <Text style={[styles.statValue, { color: colors.error }]}>₹{stats.pending}</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${stats.progress}%`,
                                    backgroundColor: stats.progress === 100 ? colors.success : colors.warning
                                }
                            ]}
                        />
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {stats.paidCount}/{stats.count} Paid
                        </Text>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {Math.round(stats.progress)}%
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    // Detail Item (Student Fee Record)
    const renderFeeItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 50)}>
            <TouchableOpacity
                onPress={() => toggleFeeStatus(item)}
                style={[styles.feeRow, { borderBottomColor: colors.border }]}
            >
                <View style={[styles.avatar, { backgroundColor: item.status === 'paid' ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={{ fontWeight: '700', color: item.status === 'paid' ? '#166534' : '#991B1B' }}>
                        {item.studentId?.name?.[0]}
                    </Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{item.studentId?.name}</Text>
                    <Text style={[styles.feeDate, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amountText, { color: colors.text }]}>₹{item.amount}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? colors.success : colors.error }]}>
                        <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    /* ---------------- MAIN UI ---------------- */
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Common Header Filter (Visible in Dashboard) */}
            <View style={{ backgroundColor: '#0f172a', paddingBottom: 20, paddingTop: 10, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <LottieView
                            style={{ width: 100, height: 100 }}
                            source={require('../../../money.json')}
                            autoPlay
                            loop
                        />
                        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginLeft: 12, marginTop: 50 }}>
                            {viewMode === 'dashboard' ? 'Fee Collection' : selectedBatch?.batchName}
                        </Text>
                    </View>



                    {viewMode === 'details' && (
                        <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Month Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {months.map(m => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => setSelectedMonth(m)}
                            style={[
                                styles.monthChip,
                                selectedMonth === m && { backgroundColor: colors.primary }
                            ]}
                        >
                            <Text style={[
                                styles.monthText,
                                selectedMonth === m ? { color: '#fff' } : { color: '#94a3b8' }
                            ]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loadingFees && viewMode === 'dashboard' ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {viewMode === 'dashboard' ? (
                        <FlatList
                            data={batches}
                            keyExtractor={item => item._id}
                            renderItem={renderBatchCard}
                            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textSecondary }}>No batches found</Text>
                            }
                        />
                    ) : (
                        // Details View
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={allFees.filter(f => f.batchId === selectedBatch._id)}
                                keyExtractor={item => item._id}
                                renderItem={renderFeeItem}
                                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No fee records found for this month.</Text>
                                        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>Generate fees to get started.</Text>
                                    </View>
                                }
                            />

                            {/* FAB for Generate Fees */}
                            <TouchableOpacity
                                style={[styles.fab, { backgroundColor: colors.primary }]}
                                onPress={handleGenerateFees}
                            >
                                <Ionicons name="flash" size={20} color="#fff" />
                                <Text style={styles.fabText}>Generate Fees</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default FeeListScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    monthChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
    },
    monthText: {
        fontWeight: '600',
        fontSize: 13,
    },
    // Batch Card Styles
    batchCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    batchName: {
        fontSize: 16,
        fontWeight: '700',
    },
    batchSub: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 12,
        opacity: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 11,
        fontWeight: '500',
    },

    // Fee Item Styles
    feeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
    },
    feeDate: {
        fontSize: 12,
        marginTop: 2,
    },
    amountText: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        gap: 8,
    },
    fabText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    }
});
