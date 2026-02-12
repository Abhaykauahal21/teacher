import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    RefreshControl,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    StatusBar,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
    Layout
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BatchListScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form
    const [batchName, setBatchName] = useState('');
    const [classLevel, setClassLevel] = useState('');
    const [timing, setTiming] = useState('');
    const [monthlyFee, setMonthlyFee] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchBatches = async () => {
        try {
            const res = await client.get('/batches');
            setBatches(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBatches();
        }, [])
    );

    const handleCreateBatch = async () => {
        if (!batchName || !classLevel || !timing || !monthlyFee) {
            Alert.alert('Incomplete', 'Please fill all details to create a batch.');
            return;
        }
        setSubmitting(true);
        try {
            await client.post('/batches', {
                batchName,
                classLevel,
                timing,
                monthlyFee: Number(monthlyFee)
            });
            setModalVisible(false);
            setBatchName('');
            setClassLevel('');
            setTiming('');
            setMonthlyFee('');
            fetchBatches();
        } catch (e) {
            Alert.alert('Error', 'Could not create batch.');
        } finally {
            setSubmitting(false);
        }
    };

    // Fintech Dark Theme Gradient
    const headerGradient = theme.dark ? ['#0f172a', '#1e293b'] : ['#0F172A', '#334155'];
    const activeBatchCount = batches.length;

    const renderItem = ({ item, index }) => {
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 100).springify()}
                layout={Layout.springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('BatchDetails', { batch: item })}
                    style={[styles.cardContainer, { backgroundColor: colors.card, shadowColor: '#000' }]}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                                <Ionicons name="bar-chart" size={20} color={colors.text} />
                            </View>
                            <View style={styles.headerTexts}>
                                <Text style={[styles.batchTitle, { color: colors.text }]}>{item.batchName}</Text>
                                <Text style={[styles.classLevel, { color: colors.textSecondary }]}>{item.classLevel}</Text>
                            </View>
                            <View style={styles.arrowBox}>
                                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.cardStats}>
                            <View>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TIMING</Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>{item.timing}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>FEE</Text>
                                <Text style={[styles.statValue, { color: colors.success }]}>₹{item.monthlyFee}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <SafeAreaView edges={['top']} style={styles.headerSafe}>
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.headerTitle}>My Batches</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={styles.addButton}
                            >
                                <Ionicons name="add" size={28} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        {/* Summary Pill */}
                        <View style={styles.summaryPill}>
                            <Ionicons name="flash" size={12} color="#F59E0B" />
                            <Text style={styles.summaryText}>{activeBatchCount} Active Classes</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} />
            ) : (
                <Animated.FlatList
                    data={batches}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBatches(); }} tintColor={colors.primary} />
                    }
                    ListHeaderComponent={<View style={{ height: 20 }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
                                <Ionicons name="folder-open-outline" size={40} color={colors.textSecondary} />
                            </View>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No batches configured</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text style={[styles.createLink, { color: colors.primary }]}>Start a new batch</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Sheet Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </TouchableOpacity>

                    <Animated.View
                        entering={FadeInUp.springify()}
                        style={[styles.modalCard, { backgroundColor: colors.card }]}
                    >
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>New Batch</Text>
                        </View>

                        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputStack}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>BATCH NAME</Text>
                                    <TextInput
                                        placeholder="Physics - Morning"
                                        placeholderTextColor={colors.textSecondary + '80'}
                                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                        value={batchName}
                                        onChangeText={setBatchName}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>CLASS</Text>
                                        <TextInput
                                            placeholder="12th"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            value={classLevel}
                                            onChangeText={setClassLevel}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>FEE (₹)</Text>
                                        <TextInput
                                            placeholder="5000"
                                            placeholderTextColor={colors.textSecondary + '80'}
                                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            value={monthlyFee}
                                            onChangeText={setMonthlyFee}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>TIMING</Text>
                                    <TextInput
                                        placeholder="10:00 AM - 11:30 AM"
                                        placeholderTextColor={colors.textSecondary + '80'}
                                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                        value={timing}
                                        onChangeText={setTiming}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: '#0F172A' }]}
                                onPress={handleCreateBatch}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Create Portfolio Item</Text>
                                )}
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        height: 180,
        backgroundColor: '#0F172A',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
    },
    headerGradient: {
        flex: 1,
        paddingHorizontal: 24,
    },
    headerSafe: {
        flex: 1,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    headerLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
        gap: 6,
    },
    summaryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerTexts: {
        flex: 1,
    },
    batchTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    classLevel: {
        fontSize: 13,
        marginTop: 2,
    },
    arrowBox: {
        opacity: 0.5,
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 16,
        opacity: 0.5,
    },
    cardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 12,
    },
    createLink: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalCard: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#CBD5E1',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        marginBottom: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    formScroll: {
        maxHeight: 500,
    },
    inputStack: {
        gap: 16,
    },
    inputGroup: {
        marginBottom: 0,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default BatchListScreen;
