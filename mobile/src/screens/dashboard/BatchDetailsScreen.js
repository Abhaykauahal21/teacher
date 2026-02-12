import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const BatchDetailsScreen = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { batch } = route.params;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const ActionItem = ({ title, subtitle, icon, onPress, color, delay }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={[styles.actionItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
            >
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.actionTextContainer}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

            <SafeAreaView style={styles.safeArea}>
                {/* Minimal Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { backgroundColor: colors.background }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Class Details</Text>
                    <View style={{ width: 44 }} />
                </View>

                <Animated.ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                >
                    {/* Batch Info Card - Clean & Minimal */}
                    <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={[styles.batchName, { color: colors.text }]}>{batch.batchName}</Text>
                                <Text style={[styles.classLevel, { color: colors.primary }]}>Class {batch.classLevel}</Text>
                            </View>
                            <View style={[styles.schoolIcon, { backgroundColor: colors.primary + '10' }]}>
                                <Ionicons name="school-outline" size={28} color={colors.primary} />
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TIMING</Text>
                                <View style={styles.statValueRow}>
                                    <Ionicons name="time-outline" size={16} color={colors.text} />
                                    <Text style={[styles.statValue, { color: colors.text }]}>{batch.timing}</Text>
                                </View>
                            </View>
                            <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.stat}>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>MONTHLY FEE</Text>
                                <View style={styles.statValueRow}>
                                    <Ionicons name="wallet-outline" size={16} color={colors.text} />
                                    <Text style={[styles.statValue, { color: colors.text }]}>₹{batch.monthlyFee}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MANAGEMENT</Text>

                    <View style={styles.actionsList}>
                        <ActionItem
                            title="Student Info"
                            subtitle="Profiles, contacts & history"
                            icon="people-outline"
                            color="#4F46E5" // Indigo
                            onPress={() => navigation.navigate('BatchStudents', { batch })}
                        />
                        <ActionItem
                            title="Attendance"
                            subtitle="Mark & view daily logs"
                            icon="calendar-outline"
                            color="#10B981" // Emerald
                            onPress={() => navigation.navigate('MarkAttendance', { batch })}
                        />
                    </View>

                </Animated.ScrollView>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    content: {
        padding: 24,
    },
    mainCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    batchName: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    classLevel: {
        fontSize: 15,
        fontWeight: '600',
    },
    schoolIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: 30,
        marginHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 8,
    },
    actionsList: {
        gap: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
    },
});

export default BatchDetailsScreen;
