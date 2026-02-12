import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Linking,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const BatchStudentsScreen = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { batch } = route.params;

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const res = await client.get(`/students?batchId=${batch._id}`);
            setStudents(res.data);
        } catch {
            Alert.alert('Error', 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStudents(); }, []));

    const handleCall = (phone) => {
        const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
        Linking.openURL(url);
    };

    const handleDelete = (student) => {
        Alert.alert(
            'Delete Student',
            `Delete ${student.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await client.delete(`/students/${student._id}`);
                        fetchStudents();
                    }
                }
            ]
        );
    };

    const renderStudent = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('StudentProfile', { studentId: item._id })}
        >
            {/* Top Row */}
            <View style={styles.topRow}>
                <View style={styles.leftInfo}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    <View>
                        <Text style={[styles.name, { color: colors.text }]}>
                            {item.name}
                        </Text>
                        <Text style={[styles.phone, { color: colors.textSecondary }]}>
                            +91 {item.phone}
                        </Text>
                    </View>
                </View>

                {/* Placeholder badge (future attendance %) */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>ACTIVE</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Actions */}
            <View style={styles.actionsRow}>
                <IconBtn icon="call-outline" color={colors.primary} onPress={() => handleCall(item.phone)} />
                <IconBtn icon="time-outline" color="#f59e0b" onPress={() => navigation.navigate('StudentProfile', { studentId: item._id })} />
                <IconBtn icon="create-outline" color={colors.textSecondary} onPress={() => navigation.navigate('EditStudent', { student: item })} />
                <IconBtn icon="trash-outline" color={colors.danger} onPress={() => handleDelete(item)} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {batch.batchName}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {batch.timing} • Class {batch.classLevel}
                    </Text>
                </View>

                <View style={[styles.countPill, { backgroundColor: colors.primary }]}>
                    <Ionicons name="people" size={16} color="#fff" />
                    <Text style={styles.countText}>{students.length}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item._id}
                    renderItem={renderStudent}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No students added yet
                        </Text>
                    }
                />
            )}

            {/* Gradient FAB */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AddStudent', { batchId: batch._id })}
                style={styles.fabWrapper}
            >
                <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fab}
                >
                    <Ionicons name="person-add" size={22} color="#fff" />
                    <Text style={styles.fabText}>Add Student</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const IconBtn = ({ icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
        <Ionicons name={icon} size={20} color={color} />
    </TouchableOpacity>
);

export default BatchStudentsScreen;

/* ================== STYLES ================== */

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },

    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },

    countPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },

    countText: {
        color: '#fff',
        fontWeight: '700',
    },

    list: {
        padding: 16,
        paddingBottom: 110,
    },

    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        elevation: 6,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },

    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },

    name: {
        fontSize: 18,
        fontWeight: '600',
    },

    phone: {
        fontSize: 14,
        marginTop: 4,
    },

    badge: {
        backgroundColor: '#ecfeff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    badgeText: {
        color: '#0284c7',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    divider: {
        height: 1,
        marginVertical: 14,
    },

    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },

    fabWrapper: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },

    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 26,
        paddingVertical: 14,
        borderRadius: 30,
        elevation: 8,
        gap: 8,
    },

    fabText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 16,
    },
});


