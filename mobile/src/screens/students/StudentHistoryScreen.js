import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../context/ThemeContext';

const StudentHistoryScreen = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    // We used route.params.student initial value, but if we edit, we want updated value.
    // However, basic params don't auto-update. We should fetch fresh student details or rely on goBack refresh.
    // For simple MVP, we will just use params. If we edit, we go back to list then back here.
    const { student } = route.params;
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.navigate('EditStudent', { student })}
                    style={{ marginRight: 15 }}
                >
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            ),
            title: 'Student Details'
        });
        fetchHistory();
    }, [navigation]);

    const fetchHistory = async () => {
        try {
            const res = await client.get(`/fees?batchId=${student.batchId}`);
            const studentFees = res.data.filter(f => f.studentId._id === student._id || f.studentId === student._id);
            setFees(studentFees);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, item.status === 'paid' ? styles.paidCard : styles.pendingCard, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                <Text style={[styles.month, { color: colors.text }]}>{item.month}</Text>
                <Text style={[styles.status, { color: item.status === 'paid' ? colors.success : colors.danger }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={[styles.amount, { color: colors.textSecondary }]}>₹{item.amount}</Text>
                {item.paymentDate && <Text style={[styles.date, { color: colors.textSecondary }]}>Paid: {new Date(item.paymentDate).toLocaleDateString()}</Text>}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
                    <Text style={[styles.subtext, { color: colors.textSecondary }]}>📱 +91 {student.phone}</Text>
                    {student.parentPhone ? (
                        <Text style={[styles.subtext, { color: colors.textSecondary }]}>👨‍👩‍👦 Parent: +91 {student.parentPhone}</Text>
                    ) : null}
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fee History</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={fees}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fee records found.</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    subtext: {
        color: '#666',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginLeft: 20,
        marginTop: 10,
    },
    list: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 1,
    },
    paidCard: {
        borderLeftColor: '#28a745',
    },
    pendingCard: {
        borderLeftColor: '#dc3545',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    month: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    status: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    amount: {
        fontSize: 14,
        color: '#555',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});

export default StudentHistoryScreen;
