import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    StatusBar,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const MarkAttendanceScreen = ({ route, navigation }) => {
    const { batch, edit, existingAttendance, viewing } = route.params;
    const { theme } = useTheme();
    const { colors } = theme;

    const [date, setDate] = useState(edit ? new Date(existingAttendance.date) : new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState(new Set());

    // Report Mode State
    const [reportMode, setReportMode] = useState(viewing || false);
    const [reportTab, setReportTab] = useState('present'); // 'present' | 'absent'

    useEffect(() => {
        if (existingAttendance) {
            // Ensure we extract IDs if students are populated objects
            const initialIds = existingAttendance.presentStudents.map(s =>
                (typeof s === 'object' && s !== null) ? s._id : s
            );
            setSelectedStudents(new Set(initialIds));
        }
        fetchStudents();
    }, [batch]);

    const fetchStudents = async () => {
        try {
            const res = await client.get(`/students?batchId=${batch._id}`);
            const activeStudents = res.data.filter(s => s.status !== 'inactive');
            activeStudents.sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));
            setStudents(activeStudents);
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (id) => {
        if (reportMode && !edit) return;

        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const toggleAll = () => {
        if (reportMode) return;
        if (selectedStudents.size === students.length) {
            setSelectedStudents(new Set());
        } else {
            const allIds = new Set(students.map(s => s._id));
            setSelectedStudents(allIds);
        }
    };

    const submitAttendance = async () => {
        if (selectedStudents.size === 0) {
            Alert.alert('Confirm', 'Mark all students as absent?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, Mark All Absent', onPress: proceedSubmit }
            ]);
            return;
        }
        proceedSubmit();
    };

    const proceedSubmit = async () => {
        setSubmitting(true);
        try {
            if (edit) {
                await client.put(`/attendance/update/${existingAttendance._id}`, {
                    presentStudents: Array.from(selectedStudents)
                });
            } else {
                await client.post('/attendance/mark', {
                    batchId: batch._id,
                    date: date.toISOString(),
                    presentStudents: Array.from(selectedStudents)
                });
            }
            // Switch to Report Mode on success instead of going back
            setReportMode(true);
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to save attendance');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Components ---

    const StudentRow = ({ item, isReport = false }) => {
        const isSelected = selectedStudents.has(item._id);

        // In report mode, only show if matches tab (or show all with indicator?)
        // Let's filter the list in the parent instead.

        return (
            <TouchableOpacity
                activeOpacity={isReport ? 1 : 0.7}
                onPress={() => !isReport && toggleStudent(item._id)}
                style={[styles.rowItem, { backgroundColor: colors.card }]}
            >
                <View style={styles.rowContent}>
                    <View style={[
                        styles.avatarCircle,
                        {
                            backgroundColor: isReport
                                ? (isSelected ? colors.success + '20' : colors.error + '20')
                                : colors.background
                        }
                    ]}>
                        <Text style={[
                            styles.avatarText,
                            {
                                color: isReport
                                    ? (isSelected ? colors.success : colors.error)
                                    : colors.text
                            }
                        ]}>
                            {item.name.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.nameText, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.rollText, { color: colors.textSecondary }]}>Roll No: {item.rollNo || 'N/A'}</Text>
                    </View>

                    {/* Checkbox for Marking Mode */}
                    {!isReport && (
                        <View style={[
                            styles.checkbox,
                            { borderColor: isSelected ? colors.primary : colors.border },
                            isSelected && { backgroundColor: colors.primary }
                        ]}>
                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                    )}

                    {/* Status Badge for Report Mode */}
                    {isReport && (
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: isSelected ? colors.success + '15' : colors.error + '15' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: isSelected ? colors.success : colors.error }
                            ]}>
                                {isSelected ? 'Present' : 'Absent'}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Derived Data
    const presentCount = selectedStudents.size;
    const absentCount = students.length - presentCount;
    const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

    // Filtered lists for Report Mode
    const reportList = students.filter(s => {
        if (reportTab === 'present') return selectedStudents.has(s._id);
        return !selectedStudents.has(s._id);
    });

    const ReportView = () => (
        <View style={styles.reportContainer}>
            {/* Success Animation/Banner */}
            {!viewing && (
                <View style={[styles.successBanner, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={[styles.successText, { color: colors.success }]}>Attendance Submitted Successfully</Text>
                </View>
            )}

            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <View style={styles.summaryHeader}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>Summary</Text>
                    <Text style={[styles.summaryDate, { color: colors.textSecondary }]}>{date.toDateString()}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={[styles.statValueBox, { borderColor: colors.success }]}>
                            <Text style={[styles.statValueLarge, { color: colors.success }]}>{presentCount}</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Present</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statValueBox, { borderColor: colors.danger }]}>
                            <Text style={[styles.statValueLarge, { color: colors.danger }]}>{absentCount}</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Absent</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.statValueBox, { borderColor: colors.primary }]}>
                            <Text style={[styles.statValueLarge, { color: colors.primary }]}>{students.length}</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.progressFill, { width: `${attendancePercentage}%`, backgroundColor: colors.success }]} />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>{attendancePercentage}% Attendance</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={[styles.tab, reportTab === 'present' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setReportTab('present')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: reportTab === 'present' ? colors.success : colors.textSecondary }
                    ]}>Present ({presentCount})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, reportTab === 'absent' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setReportTab('absent')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: reportTab === 'absent' ? colors.danger : colors.textSecondary }
                    ]}>Absent ({absentCount})</Text>
                </TouchableOpacity>
            </View>


            {/* List */}
            <FlatList
                data={reportList}
                keyExtractor={item => item._id}
                renderItem={({ item }) => <StudentRow item={item} isReport={true} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No students {reportTab}
                        </Text>
                    </View>
                }
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    {reportMode && !viewing ? (
                        // Hidden back button in Post-Submit Report Mode to force use of Done button
                        <View style={{ width: 40 }} />
                    ) : (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    )}

                    <Text style={[styles.screenTitle, { color: colors.text }]}>
                        {reportMode ? 'Attendance Report' : 'Mark Attendance'}
                    </Text>

                    {reportMode ? (
                        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.doneButton}>
                            <Text style={[styles.doneButtonText, { color: colors.primary }]}>Done</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={toggleAll} style={styles.navButton}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>
                                {presentCount === students.length ? 'Clear' : 'Select All'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Main Content */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    reportMode ? (
                        <ReportView />
                    ) : (
                        <>
                            {/* Stats Bar for Marking Mode */}
                            <View style={[styles.statsBar, { backgroundColor: colors.card }]}>
                                <Text style={[styles.statTextHighlight, { color: colors.text }]}>
                                    {presentCount} <Text style={{ fontSize: 13, fontWeight: '400', color: colors.textSecondary }}>Present</Text>
                                </Text>
                                <View style={[styles.dot, { backgroundColor: colors.border }]} />
                                <Text style={[styles.statTextHighlight, { color: colors.text }]}>
                                    {absentCount} <Text style={{ fontSize: 13, fontWeight: '400', color: colors.textSecondary }}>Absent</Text>
                                </Text>
                            </View>

                            <FlatList
                                data={students}
                                keyExtractor={item => item._id}
                                renderItem={({ item }) => <StudentRow item={item} />}
                                contentContainerStyle={styles.listContent}
                                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            />

                            {/* Footer for Marking Mode */}
                            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                                <TouchableOpacity
                                    onPress={submitAttendance}
                                    disabled={submitting}
                                    style={[
                                        styles.saveButton,
                                        { backgroundColor: colors.primary },
                                        submitting && styles.disabledButton
                                    ]}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {edit ? 'Update Attendance' : 'Submit Attendance'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )
                )}
            </SafeAreaView>
        </View>
    );
};

export default MarkAttendanceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    screenTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    navButton: {
        padding: 8,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
    doneButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    doneButtonText: {
        fontWeight: '700',
        fontSize: 14,
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 24,
        marginBottom: 8,
    },
    statTextHighlight: {
        fontSize: 20,
        fontWeight: '700',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    rowItem: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
    },
    textContainer: {
        flex: 1,
    },
    nameText: {
        fontSize: 15,
        fontWeight: '600',
    },
    rollText: {
        fontSize: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    saveButton: {
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Report Styles
    reportContainer: {
        flex: 1,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
    },
    successText: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryCard: {
        margin: 16,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    summaryDate: {
        fontSize: 13,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValueBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValueLarge: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'right',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,

    },
});