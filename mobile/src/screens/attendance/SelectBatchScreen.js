import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Dimensions,
    RefreshControl,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SelectBatchScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('attendance'); // 'attendance' or 'students'

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useFocusEffect(
        useCallback(() => {
            fetchBatches();
            animateIn();
        }, [])
    );

    const animateIn = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchBatches();
        setRefreshing(false);
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await client.get('/batches');
            setBatches(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCardPress = async (item) => {
        if (selectedTab === 'attendance') {
            const today = new Date().toISOString();
            try {
                // Check status
                const res = await client.get(`/attendance/status?batchId=${item._id}&date=${today}`);
                if (res.data.status === 'taken') {
                    Alert.alert(
                        'Attendance Already Taken',
                        `Attendance for today has already been marked.`,
                        [
                            { text: 'View Report', onPress: () => navigation.navigate('MarkAttendance', { batch: item, edit: false, viewing: true, existingAttendance: res.data.attendance }) },
                            {
                                text: 'Update Attendance',
                                onPress: () => navigation.navigate('MarkAttendance', {
                                    batch: item,
                                    edit: true,
                                    existingAttendance: res.data.attendance
                                })
                            },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                } else {
                    navigation.navigate('MarkAttendance', { batch: item, edit: false });
                }
            } catch (e) {
                console.log(e);
                // Fallback if check fails
                navigation.navigate('MarkAttendance', { batch: item });
            }
        } else {
            // Navigate to Student Info (BatchStudents)
            navigation.navigate('BatchStudents', { batch: item });
        }
    };

    const renderItem = ({ item, index }) => {
        return (
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: colors.card }]}
                    onPress={() => handleCardPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardContent}>
                        <View style={styles.batchIconContainer}>
                            <View style={[styles.batchIconCircle, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="people" size={22} color={colors.primary} />
                            </View>
                        </View>

                        <View style={styles.batchInfo}>
                            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                                {item.batchName}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {item.classLevel} • {item.timing}
                            </Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.cardFooter}>
                        <View style={styles.footerStat}>
                            <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                {item.studentsCount || 0} Students
                            </Text>
                        </View>

                        <View style={styles.footerStat}>
                            <Ionicons
                                name={selectedTab === 'attendance' ? "checkmark-done-circle-outline" : "information-circle-outline"}
                                size={16}
                                color={selectedTab === 'attendance' ? colors.success : colors.info}
                            />
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                {selectedTab === 'attendance'
                                    ? `${item.attendanceRate || '0'}% Rate`
                                    : `View Student List`
                                }
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>

                {/* Clean Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Batches</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                            Manage your classes
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('AddBatch')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Segmented Tabs */}
                <View style={styles.tabWrapper}>
                    <View style={[styles.tabContainer, { backgroundColor: theme.dark ? '#1E293B' : '#F1F5F9' }]}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                selectedTab === 'attendance' && styles.activeTabBg
                            ]}
                            onPress={() => setSelectedTab('attendance')}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === 'attendance' ? { color: colors.primary, fontWeight: '600' } : { color: colors.textSecondary }
                            ]}>Attendance</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                selectedTab === 'students' && styles.activeTabBg
                            ]}
                            onPress={() => setSelectedTab('students')}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedTab === 'students' ? { color: colors.primary, fontWeight: '600' } : { color: colors.textSecondary }
                            ]}>Student Info</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Batch List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={batches}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="layers-outline" size={64} color={colors.textSecondary + '40'} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No batches found</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

export default SelectBatchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : 0
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 15,
        fontWeight: '400',
        marginTop: 4,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    tabWrapper: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTabBg: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    batchIconContainer: {
        marginRight: 16,
    },
    batchIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    batchInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    arrowContainer: {
        padding: 4,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
    cardFooter: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 24,
    },
    footerStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});